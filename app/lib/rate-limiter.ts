interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
  minDelay?: number;
}

interface RequestRecord {
  timestamp: number;
  count: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord[]> = new Map();
  private maxRequests: number;
  private windowMs: number;
  private minDelay: number;

  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
    this.minDelay = options.minDelay || 0;
  }

  async checkAndWait(key: string = 'default'): Promise<void> {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Clean old requests outside the window
    const validRequests = requests.filter(req => 
      now - req.timestamp < this.windowMs
    );

    // Count total requests in the current window
    const totalRequests = validRequests.reduce((sum, req) => sum + req.count, 0);

    if (totalRequests >= this.maxRequests) {
      // Calculate wait time based on oldest request
      const oldestRequest = validRequests[0];
      const waitTime = Math.max(
        this.windowMs - (now - oldestRequest.timestamp),
        this.minDelay
      );
      
      console.log(`Rate limit reached. Waiting ${waitTime}ms before next request.`);
      await this.sleep(waitTime);
      
      // Recursively check again after waiting
      return this.checkAndWait(key);
    }

    // Add current request
    validRequests.push({ timestamp: now, count: 1 });
    this.requests.set(key, validRequests);

    // Apply minimum delay if specified
    if (this.minDelay > 0) {
      await this.sleep(this.minDelay);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  reset(key?: string): void {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }
}

// Gemini API specific rate limiter based on free tier limits
export const geminiRateLimiter = new RateLimiter({
  maxRequests: 15, // Conservative limit under the free tier
  windowMs: 60 * 1000, // 1 minute window
  minDelay: 4000 // 4 second minimum delay between requests
});

// Check if error indicates zero quota (exhausted free tier)
function isZeroQuotaError(error: any): boolean {
  if (error.status !== 429) return false;
  
  // Check for quota violations with limit: 0
  const quotaFailure = error.errorDetails?.find(
    (detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure'
  );
  
  if (quotaFailure?.violations) {
    return quotaFailure.violations.some(
      (violation: any) => violation.quotaMetric?.includes('free_tier')
    );
  }
  
  return error.message?.includes('limit: 0') || false;
}

// Generic retry function with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's not a rate limit error or network error
      if (error.status !== 429 && !error.message?.includes('quota') && !error.message?.includes('fetch failed')) {
        throw error;
      }
      
      // For network errors, use shorter retry with fewer attempts
      if (error.message?.includes('fetch failed')) {
        if (attempt >= 2) { // Only retry network errors twice
          throw error;
        }
      }
      
      // Don't retry if quota is completely exhausted (limit: 0)
      if (isZeroQuotaError(error)) {
        console.log('API quota completely exhausted. Cannot retry.');
        throw new Error('QUOTA_EXHAUSTED: Your Gemini API free tier quota has been completely used. Please upgrade your plan or wait for the quota to reset.');
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Extract retry delay from error if available
      let delay = baseDelay * Math.pow(2, attempt);
      
      if (error.errorDetails) {
        const retryInfo = error.errorDetails.find(
          (detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
        );
        
        if (retryInfo?.retryDelay) {
          const retrySeconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
          delay = Math.max(delay, retrySeconds * 1000);
        }
      }
      
      console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
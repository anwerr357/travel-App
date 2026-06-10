import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string): string => {
  return dayjs(dateString).format("MMMM DD, YYYY");
};

export function parseMarkdownToJson(markdownText: string): unknown | null {
  // Try multiple parsing strategies
  
  // Strategy 1: Look for JSON in markdown code blocks
  const codeBlockRegex = /```(?:json)?\n?([\s\S]+?)\n?```/;
  const codeBlockMatch = markdownText.match(codeBlockRegex);
  
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (error) {
      console.warn("Failed to parse JSON from code block:", error);
    }
  }
  
  // Strategy 2: Look for any JSON-like structure
  const jsonRegex = /\{[\s\S]*\}/;
  const jsonMatch = markdownText.match(jsonRegex);
  
  if (jsonMatch && jsonMatch[0]) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.warn("Failed to parse JSON from general match:", error);
    }
  }
  
  // Strategy 3: Try to parse the entire text as JSON (in case it's already JSON)
  try {
    return JSON.parse(markdownText.trim());
  } catch (error) {
    console.warn("Failed to parse entire text as JSON:", error);
  }
  
  console.error("No valid JSON found in response text. Raw text:", markdownText.substring(0, 500));
  return null;
}

export function parseTripData(tripData: any): Trip | null {
  if (!tripData) return null;
  
  if (typeof tripData === 'string') {
    try {
      tripData = JSON.parse(tripData);
    } catch (error) {
      console.error("Failed to parse trip data:", error);
      return null;
    }
  }
  
  // Transform AI response structure to expected Trip structure
  try {
    return {
      id: tripData.id || '',
      name: tripData.destination || '',
      country: tripData.destination || '',
      duration: tripData.duration || 0,
      travelStyle: tripData.travelStyle || '',
      groupType: tripData.groupType || '',
      budget: tripData.budget || '',
      interests: typeof tripData.interests === 'string' ? tripData.interests : (tripData.interests || []).join(', '),
      estimatedPrice: tripData.estimatedCost?.totalApproxUSD_per_couple || 
                      `$${tripData.estimatedCost || (tripData.duration * 100)}`,
      description: tripData.overview || '',
      itinerary: transformItinerary(tripData.itinerary || []),
      bestTimeToVisit: tripData.tips?.filter((tip: any) => 
        typeof tip === 'string' && tip.includes('Season')
      ) || ['Check local weather conditions'],
      weatherInfo: tripData.tips?.filter((tip: any) => 
        typeof tip === 'string' && tip.includes('Weather')
      ) || ['Varies by season'],
      imageUrls: tripData.imageUrls || [],
      location: {
        city: tripData.destination || '',
        coordinates: [0, 0] as [number, number],
        openStreetMap: ''
      } as any,
      payment_link: ''
    };
  } catch (error) {
    console.error("Failed to transform trip data:", error);
    return null;
  }
}

// Transform AI itinerary structure to expected format
function transformItinerary(aiItinerary: any[]): DayPlan[] {
  return aiItinerary.map((day: any) => ({
    day: day.day || 1,
    location: day.location || '',
    activities: [
      ...(day.morning ? [{
        time: day.morning.time || 'Morning',
        description: day.morning.activity || day.morning.description || day.morning
      }] : []),
      ...(day.afternoon ? [{
        time: day.afternoon.time || 'Afternoon', 
        description: day.afternoon.activity || day.afternoon.description || day.afternoon
      }] : []),
      ...(day.evening ? [{
        time: day.evening.time || 'Evening',
        description: day.evening.activity || day.evening.description || day.evening
      }] : [])
    ].filter(activity => activity.description)
  }));
}

export function getFirstWord(input: string = ""): string {
  return input.trim().split(/\s+/)[0] || "";
}

export const calculateTrendPercentage = (
  countOfThisMonth: number,
  countOfLastMonth: number
): TrendResult => {
  if (countOfLastMonth === 0) {
    return countOfThisMonth === 0
      ? { trend: "no change", percentage: 0 }
      : { trend: "increment", percentage: 100 };
  }

  const change = countOfThisMonth - countOfLastMonth;
  const percentage = Math.abs((change / countOfLastMonth) * 100);

  if (change > 0) {
    return { trend: "increment", percentage };
  } else if (change < 0) {
    return { trend: "decrement", percentage };
  } else {
    return { trend: "no change", percentage: 0 };
  }
};

export const formatKey = (key: keyof TripFormData) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

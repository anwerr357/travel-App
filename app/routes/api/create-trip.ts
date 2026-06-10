import { GoogleGenerativeAI } from "@google/generative-ai";
import { ID } from "appwrite";
import type { ActionFunctionArgs } from "react-router";
import { appwriteConfig, tablesDB } from "~/appwrite";
import { parseMarkdownToJson } from "~/lib/utils";
import { geminiRateLimiter, retryWithBackoff } from "~/lib/rate-limiter";
import { generateFallbackTrip } from "~/lib/fallback-trip-generator";

export const action = async ({request} : ActionFunctionArgs)=>{
    const {
        country,
        numberOfDays,
        travelStyle,
        interests,
        budget,
        grouptType,
        userId,
    } = await request.json();
    console.log('API KEY: ', process.env.GEMINI_API_KEY);
    const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY;
    try{
        const prompt = `Create a comprehensive and detailed travel itinerary for a ${numberOfDays}-day trip to ${country}.

TRIP DETAILS:
- Destination: ${country}
- Duration: ${numberOfDays} days
- Travel Style: ${travelStyle}
- Interests: ${interests}
- Budget Level: ${budget}
- Group Type: ${grouptType}
- User ID: ${userId}

REQUIREMENTS FOR THE ITINERARY:

1. **Daily Schedule Structure:**
   - Provide a detailed day-by-day breakdown from Day 1 to Day ${numberOfDays}
   - For each day, include morning, afternoon, and evening activities
   - Suggest specific times for activities when relevant
   - Include travel time between locations and rest periods

2. **Activity Recommendations:**
   - Tailor all activities to the specified interests: ${interests}
   - Match the travel style (${travelStyle}) throughout the itinerary
   - Ensure activities are appropriate for ${grouptType}
   - Consider the ${budget} budget level when suggesting activities, accommodations, and dining

3. **Practical Information:**
   - Suggest specific restaurants, cafes, and local food experiences
   - Recommend accommodation types and areas to stay
   - Include transportation options between activities and cities
   - Provide estimated costs for major activities and meals (in local currency and USD)
   - Mention any seasonal considerations, weather factors, or local events

4. **Cultural and Local Insights:**
   - Include cultural etiquette tips and local customs
   - Suggest authentic local experiences beyond typical tourist attractions
   - Recommend interaction opportunities with locals
   - Include language phrases or communication tips if applicable

5. **Logistics and Planning:**
   - Suggest optimal packing list items for the activities planned
   - Include any necessary advance bookings or reservations
   - Mention visa requirements, health precautions, or travel documents
   - Provide backup indoor/outdoor activity options for weather contingencies

6. **Format Requirements:**
   - Use clear headings and bullet points for easy reading
   - Include specific names of places, restaurants, attractions, and landmarks
   - Provide brief descriptions of why each activity fits the traveler's profile
   - End with a summary of key highlights and must-do experiences

Please create an engaging, practical, and personalized itinerary that maximizes the travel experience while staying true to the specified preferences and constraints.

IMPORTANT: Return your response as a valid JSON object wrapped in markdown code blocks like this:

\`\`\`json
{
  "destination": "${country}",
  "duration": ${numberOfDays},
  "travelStyle": "${travelStyle}",
  "budget": "${budget}",
  "groupType": "${grouptType}",
  "overview": "Brief overview of the trip",
  "itinerary": [
    {
      "day": 1,
      "location": "Location name",
      "morning": "Morning activity description",
      "afternoon": "Afternoon activity description", 
      "evening": "Evening activity description",
      "accommodation": "Accommodation suggestion",
      "estimatedCost": 100,
      "tips": ["Tip 1", "Tip 2"]
    }
  ],
  "tips": ["General tip 1", "General tip 2"],
  "estimatedCost": ${numberOfDays * 100}
}
\`\`\``;
        
        // Apply rate limiting before making the API call
        await geminiRateLimiter.checkAndWait();

        // Use retry logic with exponential backoff for the Gemini API call
        const textResult = await retryWithBackoff(async () => {
            return await genAi.getGenerativeModel({model:  'gemini-2.5-flash'}).generateContent([prompt]);
        });
        const responseText = textResult.response.text();
        const trip = parseMarkdownToJson(responseText);
        let imageUrls: string[] = [];
        try {
            if (unsplashApiKey) {
                console.log('Fetching images from Unsplash for query:', `${country} travel ${travelStyle}`);
                const imageResponse = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(country)} travel ${encodeURIComponent(travelStyle)}&client_id=${unsplashApiKey}&per_page=3`);
                console.log('Unsplash API response status:', imageResponse.status);
                
                if (imageResponse.ok) {
                    const imageData = await imageResponse.json();
                    console.log('Unsplash API response:', imageData);
                    imageUrls = imageData.results
                        ?.filter((result: any) => result.urls?.regular)
                        ?.map((result: any) => result.urls.regular)
                        ?.slice(0, 3) || [];
                    console.log('Extracted image URLs:', imageUrls);
                } else {
                    const errorText = await imageResponse.text();
                    console.error('Unsplash API error:', imageResponse.status, errorText);
                }
            } else {
                console.warn('Unsplash API key not provided');
            }
        } catch (error) {
            console.error('Failed to fetch images from Unsplash:', error);
        }
        
        // Fallback to placeholder images if no images found
        if (imageUrls.length === 0) {
            imageUrls = [
                `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop`,
                `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop`,
                `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop`
            ];
        }
        const result = await tablesDB.createRow({
            databaseId: appwriteConfig.databaseID,
            tableId: appwriteConfig.tripTableId,
            rowId: ID.unique(),
            data: {
                tripDetail: JSON.stringify(trip),
                createdAt: new Date().toISOString(),
                imageUrls: imageUrls,
                userId
            }
        })
        return {id: result.$id};
    }catch(e: any){
        console.error('Error generating AI trip: ',e);
        
        // Try fallback generation for quota-related errors and network failures
        if (e.message?.includes('QUOTA_EXHAUSTED') || e.status === 429 || e.message?.includes('fetch failed')) {
            console.log('Using fallback trip generator due to API failure');
            try {
                const fallbackTrip = generateFallbackTrip({
                    country,
                    numberOfDays,
                    travelStyle,
                    interests: typeof interests === 'string' ? interests.split(',') : interests,
                    budget,
                    grouptType
                });
                
                // Still fetch images if possible
                let imageUrls: string[] = [];
                try {
                    if (unsplashApiKey) {
                        console.log('Fallback: Fetching images from Unsplash for query:', `${country} travel ${travelStyle}`);
                        const imageResponse = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(country)} travel ${encodeURIComponent(travelStyle)}&client_id=${unsplashApiKey}&per_page=3`);
                        console.log('Fallback: Unsplash API response status:', imageResponse.status);
                        
                        if (imageResponse.ok) {
                            const imageData = await imageResponse.json();
                            console.log('Fallback: Unsplash API response:', imageData);
                            imageUrls = imageData.results
                                ?.filter((result: any) => result.urls?.regular)
                                ?.map((result: any) => result.urls.regular)
                                ?.slice(0, 3) || [];
                            console.log('Fallback: Extracted image URLs:', imageUrls);
                        } else {
                            const errorText = await imageResponse.text();
                            console.error('Fallback: Unsplash API error:', imageResponse.status, errorText);
                        }
                    } else {
                        console.warn('Fallback: Unsplash API key not provided');
                    }
                } catch (imgError) {
                    console.error('Fallback: Failed to fetch images from Unsplash:', imgError);
                }
                
                // Fallback to placeholder images if no images found
                if (imageUrls.length === 0) {
                    imageUrls = [
                        `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop`,
                        `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop`,
                        `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop`
                    ];
                }
                
                const result = await tablesDB.createRow({
                    databaseId: appwriteConfig.databaseID,
                    tableId: appwriteConfig.tripTableId,
                    rowId: ID.unique(),
                    data: {
                        tripDetail: JSON.stringify(fallbackTrip),
                        createdAt: new Date().toISOString(),
                        imageUrls: imageUrls,
                        userId,
                        generatedBy: 'fallback' // Flag to indicate this was generated by fallback
                    }
                });
                
                return {
                    id: result.$id,
                    fallbackUsed: true,
                    message: 'Trip generated using fallback due to AI quota limits'
                };
            } catch (fallbackError) {
                console.error('Fallback generation failed:', fallbackError);
            }
        }
        
        // Handle different types of errors with proper JSON serialization
        let errorResponse: any = {
            error: true,
            message: 'Failed to generate trip',
            details: null
        };

        if (e.message?.includes('QUOTA_EXHAUSTED')) {
            errorResponse = {
                error: true,
                message: 'Your Gemini API free tier quota has been completely used. Please upgrade your plan or wait for the quota to reset.',
                type: 'QUOTA_EXHAUSTED',
                upgradeUrl: 'https://ai.google.dev/pricing'
            };
        } else if (e.status === 429 || e.message?.includes('quota')) {
            errorResponse = {
                error: true,
                message: 'API quota exceeded. Please try again later.',
                type: 'QUOTA_EXCEEDED',
                retryAfter: e.errorDetails?.find((d: any) => 
                    d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
                )?.retryDelay || '60s'
            };
        } else if (e.name === 'GoogleGenerativeAIFetchError') {
            errorResponse = {
                error: true,
                message: 'AI service temporarily unavailable',
                type: 'AI_SERVICE_ERROR'
            };
        } else {
            errorResponse = {
                error: true,
                message: e.message || 'Unexpected error occurred',
                type: 'UNKNOWN_ERROR'
            };
        }
        
        return Response.json(errorResponse, { 
            status: e.status || 500 
        });
    }
}
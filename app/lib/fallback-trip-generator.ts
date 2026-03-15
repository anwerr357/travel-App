// Fallback trip generator when AI API is unavailable
export function generateFallbackTrip(params: {
  country: string;
  numberOfDays: number;
  travelStyle: string;
  interests: string[];
  budget: string;
  grouptType: string;
}) {
  const { country, numberOfDays, travelStyle, interests, budget, grouptType } = params;
  
  // Basic template-based trip generation
  const activities = getActivitiesByInterest(interests);
  const budgetLevel = getBudgetRecommendations(budget);
  
  const trip = {
    destination: country,
    duration: numberOfDays,
    travelStyle,
    budget,
    groupType: grouptType,
    overview: `A ${numberOfDays}-day ${travelStyle} trip to ${country} for ${grouptType}. This itinerary focuses on ${interests.join(', ')} with a ${budget} budget.`,
    itinerary: generateDayByDayItinerary(numberOfDays, country, activities, budgetLevel),
    tips: [
      'Check visa requirements before travel',
      'Research local customs and etiquette',
      'Consider travel insurance',
      'Pack appropriate clothing for the climate',
      'Keep copies of important documents'
    ],
    estimatedCost: budgetLevel.dailyBudget * numberOfDays
  };
  
  return trip;
}

function getActivitiesByInterest(interests: string[]): string[] {
  const activityMap: Record<string, string[]> = {
    'culture': ['Visit local museums', 'Explore historic sites', 'Attend cultural performances'],
    'nature': ['Nature walks', 'Scenic viewpoints', 'Wildlife observation'],
    'food': ['Local restaurant visits', 'Food markets', 'Cooking classes'],
    'adventure': ['Hiking trails', 'Adventure sports', 'Outdoor activities'],
    'relaxation': ['Spa visits', 'Beach time', 'Peaceful gardens'],
    'shopping': ['Local markets', 'Shopping districts', 'Souvenir hunting'],
    'nightlife': ['Local bars', 'Entertainment venues', 'Evening walks'],
    'photography': ['Scenic spots', 'Architecture tours', 'Golden hour locations']
  };
  
  const activities: string[] = [];
  interests.forEach(interest => {
    const interestActivities = activityMap[interest.toLowerCase()] || ['Local exploration'];
    activities.push(...interestActivities);
  });
  
  return activities.length > 0 ? activities : ['Sightseeing', 'Local exploration', 'Cultural experiences'];
}

function getBudgetRecommendations(budget: string) {
  const budgetMap: Record<string, { dailyBudget: number; accommodation: string; dining: string }> = {
    'budget': {
      dailyBudget: 50,
      accommodation: 'Hostels or budget hotels',
      dining: 'Local eateries and street food'
    },
    'mid-range': {
      dailyBudget: 100,
      accommodation: 'Mid-range hotels',
      dining: 'Mix of local restaurants and cafes'
    },
    'luxury': {
      dailyBudget: 250,
      accommodation: 'Luxury hotels or resorts',
      dining: 'Fine dining and premium restaurants'
    }
  };
  
  return budgetMap[budget.toLowerCase()] || budgetMap['mid-range'];
}

function generateDayByDayItinerary(
  numberOfDays: number, 
  country: string, 
  activities: string[], 
  budgetLevel: any
) {
  const itinerary = [];
  
  for (let day = 1; day <= numberOfDays; day++) {
    const dayActivities = activities.slice(0, 3); // Rotate through activities
    activities.push(activities.shift()!); // Rotate for next day
    
    itinerary.push({
      day,
      location: country,
      morning: dayActivities[0] || 'Explore local area',
      afternoon: dayActivities[1] || 'Visit popular attractions',
      evening: dayActivities[2] || 'Local dining experience',
      accommodation: budgetLevel.accommodation,
      estimatedCost: budgetLevel.dailyBudget,
      tips: [
        'Start early to avoid crowds',
        'Stay hydrated',
        'Respect local customs'
      ]
    });
  }
  
  return itinerary;
}
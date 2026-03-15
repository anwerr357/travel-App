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

export function parseTripData(jsonString: string): Trip | null {
  try {
    const data: Trip = JSON.parse(jsonString);

    return data;
  } catch (error) {
    console.error("Failed to parse trip data:", error);
    return null;
  }
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

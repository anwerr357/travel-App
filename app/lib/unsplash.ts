const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
];

export async function fetchTripImages(query: string, count: number = 3): Promise<string[]> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!apiKey) {
    console.warn("Unsplash API key not provided, using placeholder images");
    return PLACEHOLDER_IMAGES.slice(0, count);
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${apiKey}&per_page=${count}`
    );

    if (!response.ok) {
      console.error("Unsplash API error:", response.status, await response.text());
      return PLACEHOLDER_IMAGES.slice(0, count);
    }

    const data = await response.json();

    const urls: string[] = (data.results || [])
      .map((result: any) => result.urls?.regular)
      .filter(Boolean)
      .slice(0, count);

    return urls.length > 0 ? urls : PLACEHOLDER_IMAGES.slice(0, count);
  } catch (error) {
    console.error("Failed to fetch images from Unsplash:", error);
    return PLACEHOLDER_IMAGES.slice(0, count);
  }
}

const FALLBACK_COUNTRIES: Country[] = [
  { name: "🇺🇸 United States", coordinates: [39.8283, -98.5795], value: "United States" },
  { name: "🇬🇧 United Kingdom", coordinates: [55.3781, -3.436], value: "United Kingdom" },
  { name: "🇫🇷 France", coordinates: [46.6034, 1.8883], value: "France" },
  { name: "🇩🇪 Germany", coordinates: [51.1657, 10.4515], value: "Germany" },
  { name: "🇯🇵 Japan", coordinates: [36.2048, 138.2529], value: "Japan" },
];

export async function loadCountries(): Promise<Country[]> {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flag,latlng");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("restcountries returned a non-array response");
      return FALLBACK_COUNTRIES;
    }

    return data.map((country: any) => ({
      name: country?.flag + " " + country?.name?.common,
      coordinates: country?.latlng,
      value: country?.name?.common,
    }));
  } catch (error) {
    console.error("Failed to load countries:", error instanceof Error ? error.message : String(error));
    return FALLBACK_COUNTRIES;
  }
}

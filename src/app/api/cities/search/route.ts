import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ cities: [] });
  }

  try {
    // Try Google Places API first
    const cities = await searchWithGooglePlaces(query);
    if (cities.length > 0) {
      return NextResponse.json({ cities });
    }

    // Fallback to Nominatim
    const nominatimCities = await searchWithNominatim(query);
    return NextResponse.json({ cities: nominatimCities });
  } catch (error) {
    console.error("City search error:", error);
    
    // Final fallback to Nominatim
    try {
      const cities = await searchWithNominatim(query);
      return NextResponse.json({ cities });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: "Failed to search cities" },
        { status: 500 }
      );
    }
  }
}

async function searchWithGooglePlaces(query: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("No Google Places API key");
  }

  const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat.mainText,suggestions.placePrediction.structuredFormat.secondaryText,suggestions.placePrediction.types",
    },
    body: JSON.stringify({
      input: query,
      includedPrimaryTypes: ["locality", "administrative_area_level_1", "country"],
      includeQueryPredictions: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status}`);
  }

  const data = await response.json();
  
  return (data.suggestions || [])
    .map((s: any) => s.placePrediction)
    .filter((p: any) => 
      p.types && (
        p.types.includes('locality') || 
        p.types.includes('administrative_area_level_1') ||
        p.types.includes('country')
      )
    )
    .map((p: any) => ({
      id: p.placeId,
      name: p.structuredFormat?.mainText?.text || p.text?.text || "",
      country: p.structuredFormat?.secondaryText?.text || "",
      type: p.types?.[0] || "unknown"
    }))
    .slice(0, 8);
}

async function searchWithNominatim(query: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=8&featuretype=city&accept-language=en`
  );

  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status}`);
  }

  const data = await response.json();
  
  return data
    .filter((item: any) => 
      item.type === 'city' || 
      item.type === 'administrative' ||
      item.type === 'town'
    )
    .map((item: any) => ({
      id: item.place_id.toString(),
      name: item.name || item.display_name.split(',')[0],
      country: item.address?.country,
      state: item.address?.state,
      type: item.type
    }))
    .slice(0, 8);
}

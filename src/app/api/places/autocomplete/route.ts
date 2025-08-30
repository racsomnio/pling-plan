import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GOOGLE_PLACES_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input") || "";
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!input) {
    return NextResponse.json({ suggestions: [] });
  }

  const body: any = {
    input,
    includedPrimaryTypes: ["establishment", "tourist_attraction", "point_of_interest"],
    // return place predictions; omit query predictions for now
    includeQueryPredictions: false,
  };

  if (lat && lng) {
    body.locationBias = {
      circle: {
        center: { latitude: Number(lat), longitude: Number(lng) },
        radius: 50000,
      },
    };
  }

  const resp = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      // Request only needed fields
      "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat.mainText,suggestions.placePrediction.structuredFormat.secondaryText",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    return NextResponse.json({ error: "Places autocomplete failed", details: txt }, { status: 500 });
  }

  const data = await resp.json();

  const suggestions = (data.suggestions || [])
    .map((s: any) => s.placePrediction)
    .filter(Boolean)
    .map((p: any) => ({
      id: p.placeId as string,
      mainText: p.structuredFormat?.mainText?.text || p.text?.text || "",
      secondaryText: p.structuredFormat?.secondaryText?.text || "",
    }));

  return NextResponse.json({ suggestions });
}



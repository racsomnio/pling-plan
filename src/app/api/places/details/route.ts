import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GOOGLE_PLACES_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");
  if (!placeId) {
    return NextResponse.json({ error: "Missing placeId" }, { status: 400 });
  }

  const resp = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,formattedAddress,location`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
    },
    cache: "no-store",
  });

  if (!resp.ok) {
    const txt = await resp.text();
    return NextResponse.json({ error: "Places details failed", details: txt }, { status: 500 });
  }

  const data = await resp.json();
  const result = {
    id: data.id as string,
    name: data.displayName?.text || "",
    address: data.formattedAddress || "",
    lat: data.location?.latitude,
    lng: data.location?.longitude,
  };

  return NextResponse.json({ result });
}



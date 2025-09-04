import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "Unknown";
  
  // Simple, reliable image response
  const imageData = {
    image: {
      url: `https://picsum.photos/800/600?random=${encodeURIComponent(city)}`,
      alt: `${city} city view`,
      photographer: "Picsum Photos",
      unsplashUrl: `https://unsplash.com/s/photos/${encodeURIComponent(city)}-city`
    }
  };
  
  return NextResponse.json(imageData);
}

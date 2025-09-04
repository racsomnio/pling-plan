import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "";
  const country = searchParams.get("country") || "";
  const sortBy = searchParams.get("sort") || "popular"; // popular, latest, relevant
  const multiple = searchParams.get("multiple") === "true";

  console.log("City image API called with:", { city, country, sortBy, multiple });

  if (!city) {
    return NextResponse.json({ error: "City parameter is required" }, { status: 400 });
  }

  // Try Unsplash API only
  try {
    if (multiple) {
      const images = await getMultipleUnsplashImages(city, country, sortBy);
      if (images && images.length > 0) {
        console.log("Unsplash API succeeded, returning multiple images:", images.length);
        return NextResponse.json({ images });
      } else {
        console.log("Unsplash API returned no images");
        throw new Error("No images found on Unsplash");
      }
    } else {
      const image = await getUnsplashImage(city, country, sortBy);
      if (image) {
        console.log("Unsplash API succeeded, returning single image:", image);
        return NextResponse.json({ image });
      } else {
        console.log("Unsplash API returned null");
        throw new Error("No image found on Unsplash");
      }
    }
  } catch (error) {
    console.log("Unsplash API failed:", error);
    
    // Return error response instead of fallback
    return NextResponse.json({ 
      error: "Failed to fetch image from Unsplash",
      message: "Please check your Unsplash API key or try again later"
    }, { status: 500 });
  }
}

async function getMultipleUnsplashImages(city: string, country: string, sortBy: string) {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!apiKey || apiKey === 'demo') {
    throw new Error("Unsplash API key not configured. Please set UNSPLASH_ACCESS_KEY in your environment variables.");
  }

  try {
    // Single search for curated city images (matching website behavior)
    const searchQuery = city;
    console.log("Searching Unsplash for curated images:", searchQuery);
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=30&order_by=curated`,
      {
        headers: {
          'Authorization': `Client-ID ${apiKey}`,
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Unsplash API error:", response.status, errorText);
      throw new Error(`Unsplash API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Unsplash API response:", { total: data.total, results: data.results?.length || 0 });
    
    if (!data.results || data.results.length === 0) {
      throw new Error(`No images found for "${city}"`);
    }
    
    // Take the first 3 curated images
    const topPhotos = data.results.slice(0, 3);
    
    console.log("Selected top 3 curated images");
    
    return topPhotos.map((photo: any) => ({
      url: photo.urls.regular,
      alt: photo.alt_description || `${city} city view`,
      photographer: photo.user?.name || "Unknown",
      unsplashUrl: photo.links.html
    }));
  } catch (error) {
    console.error("Unsplash API error:", error);
    throw error;
  }
}

async function getUnsplashImage(city: string, country: string, sortBy: string) {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!apiKey || apiKey === 'demo') {
    throw new Error("Unsplash API key not configured. Please set UNSPLASH_ACCESS_KEY in your environment variables.");
  }

  try {
    // Single search for curated city images (matching website behavior)
    const searchQuery = city;
    console.log("Searching Unsplash for curated image:", searchQuery);
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=10&order_by=curated`,
      {
        headers: {
          'Authorization': `Client-ID ${apiKey}`,
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Unsplash API error:", response.status, errorText);
      throw new Error(`Unsplash API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Unsplash API response:", { total: data.total, results: data.results?.length || 0 });
    
    if (!data.results || data.results.length === 0) {
      throw new Error(`No images found for "${city}"`);
    }
    
    // Take the first (most curated) image
    const bestPhoto = data.results[0];
    
    console.log("Selected curated image:", bestPhoto.alt_description);
    
    return {
      url: bestPhoto.urls.regular,
      alt: bestPhoto.alt_description || `${city} city view`,
      photographer: bestPhoto.user?.name || "Unknown",
      unsplashUrl: bestPhoto.links.html
    };
  } catch (error) {
    console.error("Unsplash API error:", error);
    throw error;
  }
}

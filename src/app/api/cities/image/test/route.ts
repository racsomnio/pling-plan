import { NextResponse } from "next/server";

export async function GET() {
  // Test the city image API with a simple city
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/cities/image?city=Paris&country=France`);
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ 
        success: true, 
        message: "City image API is working",
        testData: data 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "City image API returned error",
        status: response.status 
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "Failed to test city image API",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const runtime = "edge";

const ActivitiesSchema = z.object({
  activities: z.array(
    z.object({
      name: z.string(),
      address: z.string().optional().default(""),
      lat: z.number().optional(),
      lng: z.number().optional(),
      time: z.string().optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional().default([]),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { destination, interests, date, context } = await req.json();

    console.log('Suggest endpoint called with:', { destination, interests, date, context });
    
         const { object } = await generateObject({
       model: google("gemini-2.5-pro"),
       schema: ActivitiesSchema,
             system:
         "You are a travel planning assistant. Generate 3-6 activities that fit the user's interests and destination. For each activity: include specific coordinates (lat/lng) when possible, detailed notes with practical information (hours, tips, requirements), and ALWAYS include a suggested start time (time field) based on the activity type. For example: morning (9:00 AM) for hikes and outdoor activities, afternoon (2:00 PM) for museums and indoor activities, evening (7:00 PM) for restaurants and nightlife. Focus on providing valuable, actionable information with realistic timing.",
       prompt: `Destination: ${destination || "Unknown"}\nInterests: ${
         interests || "General"
       }\nDate: ${date || "Trip day"}${context ? `\nContext from chat: ${context}` : ""}\n\nGenerate activities with specific coordinates when possible, detailed notes including practical information like hours, tips, requirements, and ALWAYS include a suggested start time for each activity. Consider the activity type when suggesting times (morning for outdoor activities, afternoon for cultural activities, evening for dining/nightlife). Return a JSON object only.`,
    });

    console.log('Generated activities:', object);

    return new Response(JSON.stringify(object), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("/api/activities/suggest error", err);
    return new Response(JSON.stringify({ error: "Suggest failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}



import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

     const systemPrompt = "You are a travel planning assistant. When users ask for activities, suggestions, or travel ideas, respond with ONLY a JSON array in this format: [{\"name\":\"Activity Name\",\"address\":\"Address\",\"lat\":36.1699,\"lng\":-115.1398,\"time\":\"Specific time (e.g., 9:00 AM, 2:30 PM, 7:00 PM)\",\"notes\":\"Practical info: hours, prices, tips, must-try items, hidden gems, local favorites\",\"tags\":[\"tag1\",\"tag2\"]}]. ALWAYS include coordinates. Time must be specific hours - NO day prefixes or general terms. For general questions, greetings, or non-activity requests, respond conversationally with short, quick answers in readable format.";

     console.log('Using system prompt:', systemPrompt);

     const result = await streamText({
       model: google("gemini-2.5-pro"),
       messages,
       system: systemPrompt,
     });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("/api/chat error", err);
    return new Response(
      JSON.stringify({ error: "Chat failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}



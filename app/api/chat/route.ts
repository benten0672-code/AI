import { NextResponse } from "next/server";
import { generateOpenAIResponse, type ChatMessage } from "@/lib/providers/openai";
import { generateGeminiResponse, type GeminiMessage } from "@/lib/providers/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const provider = body.provider === "gemini" ? "gemini" : "openai";
    const history = Array.isArray(body.history) ? body.history : [];
    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

    const response = provider === "gemini"
      ? await generateGeminiResponse(message, history as GeminiMessage[])
      : await generateOpenAIResponse(message, history as ChatMessage[]);

    return NextResponse.json({ response, provider });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate response." }, { status: 500 });
  }
}

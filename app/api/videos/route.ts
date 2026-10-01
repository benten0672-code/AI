import { NextResponse } from "next/server";
import { generateVideo } from "@/lib/providers/media";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) return NextResponse.json({ error: "Video prompt is required." }, { status: 400 });
    return NextResponse.json(await generateVideo(prompt));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate video." }, { status: 500 });
  }
}

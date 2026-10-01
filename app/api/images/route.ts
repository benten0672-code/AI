import { NextResponse } from "next/server";
import { generateImage } from "@/lib/providers/media";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) return NextResponse.json({ error: "Image prompt is required." }, { status: 400 });
    return NextResponse.json(await generateImage(prompt));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate image." }, { status: 500 });
  }
}

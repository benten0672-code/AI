import { GoogleGenAI } from "@google/genai";

export type GeminiMessage = {
  role: "user" | "assistant";
  content: string;
};

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({
    apiKey,
  });
}

export async function generateGeminiResponse(
  prompt: string,
  history: GeminiMessage[] = []
) {
  const ai = getClient();

  const input = [
    ...history.map((message) => ({
      type: "user_input" as const,
      content: [
        {
          type: "text" as const,
          text:
            message.role === "assistant"
              ? `Assistant: ${message.content}`
              : message.content,
        },
      ],
    })),

    {
      type: "user_input" as const,
      content: [
        {
          type: "text" as const,
          text: prompt,
        },
      ],
    },
  ];

  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",
    store: false,
    input,
  });

  return (
    interaction.output_text ||
    "Gemini did not return a response."
  );
}
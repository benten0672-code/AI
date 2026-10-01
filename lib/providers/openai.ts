import OpenAI from "openai";

export type ChatMessage = { role: "user" | "assistant"; content: string };

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
  return new OpenAI({ apiKey });
}

export async function generateOpenAIResponse(prompt: string, history: ChatMessage[] = []) {
  const client = getClient();
  const input = [
    ...history.map(message => ({ role: message.role, content: message.content })),
    { role: "user" as const, content: prompt }
  ];
  const response = await client.responses.create({ model: "gpt-5", input });
  return response.output_text || "The AI did not return a response.";
}

export type ImageGenerationResult = {
  type: "image";
  url?: string;
  base64?: string;
  revisedPrompt?: string;
};

export type VideoGenerationResult = {
  type: "video";
  id?: string;
  status?: string;
  url?: string;
  message?: string;
};

function getOpenAIKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured.");
  return key;
}

async function readJson(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || data?.message || `Request failed with status ${response.status}.`);
  return data;
}

export async function generateImage(prompt: string): Promise<ImageGenerationResult> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${getOpenAIKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1024" })
  });
  const data = await readJson(response);
  const image = data?.data?.[0];
  if (!image) throw new Error("No image was returned.");
  return { type: "image", url: image.url, base64: image.b64_json, revisedPrompt: image.revised_prompt };
}

export async function generateVideo(prompt: string): Promise<VideoGenerationResult> {
  const videoProviderUrl = process.env.VIDEO_API_URL;
  if (!videoProviderUrl) return {
    type: "video",
    status: "not_configured",
    message: "Video generation is ready in Nexora, but no video provider is configured yet."
  };

  const response = await fetch(videoProviderUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  const data = await readJson(response);
  return { type: "video", id: data.id, status: data.status, url: data.url, message: data.message };
}


import "dotenv/config";

const SARVAM_API_URL = "https://api.sarvam.ai/v1/chat/completions";

export async function generateSarvamResponse({
  systemPrompt,
  userPrompt,
  temperature = 0.1,
  maxTokens = 12000,
}) {
  const apiKey = process.env.SARVAM_API_KEY;

  if (!apiKey) {
    throw new Error("SARVAM_API_KEY is missing from .env");
  }

  try {
    const response = await fetch(SARVAM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        model: "sarvam-105b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        reasoning_effort: null,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(90000),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error?.message ||
        data.message ||
        `Sarvam API returned status ${response.status}`
      );
    }

    const choice = data.choices?.[0];
    const content = choice?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      throw new Error("Sarvam returned empty or non-text content");
    }

    return {
      content,
      finishReason: choice.finish_reason || null,
      usage: data.usage || null,
      model: data.model || null,
    };

  } catch (error) {
    console.error("Sarvam API error:", error.message);
    throw new Error(`Sarvam AI request failed: ${error.message}`);
  }
}

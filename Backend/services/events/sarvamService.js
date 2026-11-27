import "dotenv/config";

const SARVAM_API_URL = "https://api.sarvam.ai/v1/chat/completions";

const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  return (
    error?.retryable === true ||
    error?.name === "TimeoutError" ||
    error?.name === "AbortError" ||
    error?.cause?.code === "ECONNRESET" ||
    error?.cause?.code === "ETIMEDOUT" ||
    error?.message === "fetch failed"
  );
}

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

  let lastError = null;

  // Verification runs several Sarvam calls back to back. A transient
  // 429/5xx or timeout used to surface as "could not verify event" and the
  // event was silently dropped, so transient failures are retried.
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
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
        const error = new Error(
          data.error?.message ||
            data.message ||
            `Sarvam API returned status ${response.status}`
        );

        error.retryable = RETRYABLE_STATUSES.has(response.status);

        throw error;
      }

      const choice = data.choices?.[0];
      const content = choice?.message?.content;

      if (typeof content !== "string" || !content.trim()) {
        const error = new Error("Sarvam returned empty or non-text content");

        error.retryable = true;

        throw error;
      }

      return {
        content,
        finishReason: choice.finish_reason || null,
        usage: data.usage || null,
        model: data.model || null,
      };
    } catch (error) {
      lastError = error;

      if (attempt < MAX_ATTEMPTS && isRetryableError(error)) {
        const delay = 1000 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);

        console.warn(
          `Sarvam attempt ${attempt} failed (${error.message}); retrying in ${delay}ms`
        );

        await sleep(delay);
        continue;
      }

      break;
    }
  }

  console.error("Sarvam API error:", lastError.message);
  throw new Error(`Sarvam AI request failed: ${lastError.message}`);
}
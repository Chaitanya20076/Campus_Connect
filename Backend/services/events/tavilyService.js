
import "dotenv/config";

const TAVILY_API_URL = "https://api.tavily.com/search";

export async function searchEvents({
  query,
  location = "",
  category = "",
  maxResults = 10,
}) {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is missing from the .env file");
  }

  if (!query || typeof query !== "string" || !query.trim()) {
    throw new Error("A valid search query is required");
  }

  const searchQuery = [
    query.trim(),
    location ? `in ${location}` : "",
    category ? `category: ${category}` : "",
    "event registration official website dates",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const response = await fetch(TAVILY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: searchQuery,
        topic: "general",
        search_depth: "advanced",
        max_results: Math.min(Math.max(Number(maxResults) || 10, 1), 20),
        include_answer: false,
        include_raw_content: true,
      }),
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.detail ||
        data.message ||
        `Tavily API returned status ${response.status}`
      );
    }

    const results = (data.results || []).map((item) => ({
      title: item.title || "",
      url: item.url || "",
      content: item.content || "",
      rawContent: item.raw_content || "",
      publishedDate: item.published_date || null,
      score: item.score ?? null,
    }));

    return {
      success: true,
      query: searchQuery,
      answer: data.answer || null,
      totalResults: results.length,
      results,
    };
  } catch (error) {
    console.error("Tavily search error:", error.message);

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new Error("Tavily search timed out. Please try again.");
    }

    throw new Error(`Event web search failed: ${error.message}`);
  }
}

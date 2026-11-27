const TAVILY_API_URL = "https://api.tavily.com/search";

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDomain(url = "") {
  try {
    return new URL(url).hostname
      .toLowerCase()
      .replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isInstitutionDomain(domain) {
  return (
    domain.endsWith(".ac.in") ||
    domain.endsWith(".edu.in") ||
    domain.endsWith(".edu") ||
    domain.endsWith(".gov.in")
  );
}

function getNameMatchScore(collegeName, result) {
  const requested = normalize(collegeName);
  const content = normalize(
    `${result.title || ""} ${result.content || ""} ${result.raw_content || ""}`
  );

  const words = requested
    .split(" ")
    .filter((word) => word.length > 1);

  const matchedWords = words.filter((word) =>
    content.includes(word)
  );

  const score = words.length
    ? matchedWords.length / words.length
    : 0;

  // Handle common abbreviations such as RNSIT.
  const abbreviation = words
    .filter((word) => !["of", "the", "and", "in"].includes(word))
    .map((word) => word[0])
    .join("");

  const abbreviationMatch =
    abbreviation.length >= 3 &&
    normalize(content).includes(abbreviation);

  return {
    score,
    abbreviationMatch,
    matchedWords,
  };
}

async function tavilySearch(query, apiKey) {
  const response = await fetch(TAVILY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      topic: "general",
      search_depth: "advanced",
      max_results: 8,
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
        `Tavily API error: ${response.status}`
    );
  }

  return data.results || [];
}

export async function verifyCollegeExistence(collegeName) {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is missing from Backend/.env");
  }

  const cleanName = String(collegeName || "").trim();

  if (cleanName.length < 3 || cleanName.length > 150) {
    throw new Error("Please enter a valid college name.");
  }

  console.log(`🔎 Tavily searching for: ${cleanName}`);

  // Two search variations improve coverage for abbreviated names.
  const queries = [
    `"${cleanName}" college university official website`,
    `${cleanName} institution college India Bengaluru`,
  ];

  const searchResponses = await Promise.all(
    queries.map((query) => tavilySearch(query, apiKey))
  );

  const allResults = searchResponses.flat();

  // Remove duplicate URLs.
  const uniqueResults = [
    ...new Map(
      allResults.map((item) => [item.url, item])
    ).values(),
  ];

  console.log(`📚 Tavily returned ${uniqueResults.length} unique results.`);

  const evidence = uniqueResults.map((result) => {
    const domain = getDomain(result.url);
    const match = getNameMatchScore(cleanName, result);

    const officialDomain = isInstitutionDomain(domain);

    const institutionContext =
      /\b(college|university|institute|institution|campus|admission|education)\b/i
        .test(
          `${result.title || ""} ${result.content || ""} ${result.raw_content || ""}`
        );

    const nameMatched =
      match.score >= 0.6 || match.abbreviationMatch;

    return {
      title: result.title || domain,
      url: result.url,
      domain,
      score: match.score,
      officialDomain,
      nameMatched,
      institutionContext,
      matched:
        nameMatched && institutionContext,
    };
  });

  const matchedEvidence = evidence.filter(
    (item) => item.matched
  );

  // One credible institution domain is enough.
  const officialMatch = matchedEvidence.find(
    (item) => item.officialDomain
  );

  // Otherwise require two independent matching domains.
  const distinctDomains = [
    ...new Set(
      matchedEvidence.map((item) => item.domain)
    ),
  ];

  const verified = Boolean(
    officialMatch || distinctDomains.length >= 2
  );

  console.log(
    verified
      ? `✅ College verification successful: ${cleanName}`
      : `⚠️ College verification inconclusive: ${cleanName}`
  );

  return {
    success: true,
    verified,
    collegeName: cleanName,
    message: verified
      ? "College Registered ✅"
      : "We could not confidently verify this college. Check the spelling or try the full official name.",
    sources: matchedEvidence.slice(0, 5).map((item) => ({
      title: item.title,
      url: item.url,
      domain: item.domain,
    })),

    // Useful while debugging. Remove this field in production.
    debug: {
      tavilyResults: uniqueResults.length,
      matchingResults: matchedEvidence.length,
      matchedDomains: distinctDomains,
    },
  };
}
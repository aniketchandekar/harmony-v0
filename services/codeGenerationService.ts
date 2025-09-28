export interface FallbackCode {
  code: string;
  bundleSizeImpact: string; // e.g., "~2 KB"
  notes: string;
}

/**
 * Safe wrapper for generating a fallback. In browser environments or when no
 * API key is available this will return a deterministic mock response so the
 * UI remains functional. In a Node/server environment with an API key it will
 * attempt to call the real AI service via dynamic import.
 */
export const generateFallback = async (
  featureName: string,
  unsupportedBrowsers: string[],
  baselineData: any
): Promise<FallbackCode> => {
  // If running in the browser (no process.env available) or missing API key,
  // return a simple mocked fallback to avoid bundling server-only SDKs.
  const isBrowser = typeof window !== "undefined";
  const apiKey =
    (process && (process.env as any)?.API_KEY) ||
    (process && (process.env as any)?.GEMINI_API_KEY) ||
    (globalThis as any)?.API_KEY ||
    (globalThis as any)?.GEMINI_API_KEY;

  if (isBrowser || !apiKey) {
    // If running in the browser try to call a local AI proxy at /api/generate-fallback
    try {
      const resp = await fetch("/api/generate-fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureName,
          unsupportedBrowsers,
          baselineData,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        return data as FallbackCode;
      }
      console.warn(
        "generateFallback: local server returned non-ok",
        resp.status
      );
    } catch (err) {
      console.warn(
        "generateFallback: could not reach local server, falling back to mock",
        err
      );
    }

    console.warn(
      "generateFallback: running without server AI integration, returning mock fallback"
    );
    return {
      code: `// Mock fallback for ${featureName}\n// Unsupported browsers: ${unsupportedBrowsers.join(
        ", "
      )}\nfunction ${featureName.replace(
        /[^a-zA-Z0-9_]/g,
        "_"
      )}_fallback() {\n  // Provide a simple progressive enhancement or polyfill here.\n  console.log(\"Fallback: ${featureName}\");\n}\n`,
      bundleSizeImpact: "<1 KB",
      notes:
        "This is a mock fallback returned because server-side AI is not available. Configure API_KEY on the server to enable AI-generated fallbacks.",
    };
  }

  try {
    // Dynamically import the server-side SDK so bundlers don't include it in the client bundle
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const prompt = `
      You are an expert frontend developer specializing in cross-browser compatibility.
      A user wants to use the "${featureName}" feature, but it's not supported in the following browsers: ${unsupportedBrowsers.join(
      ", "
    )}.

      Baseline support data:
      ${JSON.stringify(baselineData, null, 2)}

      Your task is to generate a polyfill or a safe, alternative code snippet (e.g., a JavaScript function or a CSS class) to provide fallback functionality for these older browsers.

      Please return a strict JSON object with the following structure:
      {
        "code": "The polyfill or fallback code snippet. Use JavaScript, CSS, or HTML as appropriate. The code should be production-ready.",
        "bundleSizeImpact": "A string estimating the bundle size impact (e.g., '~2 KB', '<1 KB', 'N/A').",
        "notes": "A brief explanation of the fallback approach, its limitations, and any required setup (e.g., 'This polyfill requires running a script on page load.')."
      }

      Do not include any markdown fences or other text outside the JSON object.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const jsonText = result.response.text();
    const parsedResponse = JSON.parse(jsonText);
    return parsedResponse as FallbackCode;
  } catch (error) {
    console.error("AI fallback generation failed:", error);
    // Fall back to a friendly error payload for the UI
    return {
      code: `// Failed to generate fallback: ${String(error)}`,
      bundleSizeImpact: "N/A",
      notes:
        "AI service failed. Ensure server-side API_KEY is configured and the server has outbound network access.",
    };
  }
};

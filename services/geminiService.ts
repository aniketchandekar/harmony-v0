import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisSection } from "../components/AnalysisDisplay";
import {
  getFeatureBaselineStatus,
  getFeatureBaselineByName,
  resolveFeatureIdByName,
} from "./webFeaturesService";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]);
      } else {
        resolve("");
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeUIDesign = async (
  file: File,
  userNotes?: string
): Promise<AnalysisSection[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const imagePart = await fileToGenerativePart(file);

  const userNotesBlock = (userNotes || "").trim()
    ? `\nUser additional preferences (consider and incorporate where relevant):\n${userNotes}\n`
    : "";

  const prompt = `You are a world-class senior frontend engineer. Analyze the provided UI screenshot and provide a detailed, actionable implementation plan. Structure your response into distinct sections.
${userNotesBlock}
Return strict JSON matching this TypeScript type: { plan: Array<{ title: string; content: string; webFeatures?: Array<{ featureId: string; name: string }> }> }.
Important:
- Integrate the user's additional preferences when feasible (e.g., smooth scrolling: reference CSS/JS approaches, performance and accessibility considerations).
- Keep the plan concrete and specific; mention relevant web platform features by ID/name when possible.
- AVOID DUPLICATES: Each web platform feature should only appear ONCE across all sections. Do not repeat the same feature in multiple sections.
- If a feature applies to multiple sections, mention it only in the most relevant section.
- Use unique, specific feature names to prevent confusion (e.g., "CSS Grid Layout" instead of just "Grid").
Do not include any markdown fences.`;

  // Plain JSON schema compatible with @google/generative-ai (when supported)
  const responseSchema: any = {
    type: "object",
    properties: {
      plan: {
        type: "array",
        description: "An array of implementation plan sections.",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            webFeatures: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  featureId: { type: "string" },
                  name: { type: "string" },
                },
                required: ["featureId", "name"],
              },
            },
          },
          required: ["title", "content"],
        },
      },
    },
    required: ["plan"],
  };

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        // responseSchema is supported in newer SDKs; harmless if ignored
        responseSchema,
      },
    });

    const jsonText = result.response.text().trim();
    const cleanedJson = jsonText.replace(/^```json\s*|```$/g, "");
    const parsedResponse = JSON.parse(cleanedJson);

    const plan = parsedResponse.plan || [];

    // Pool of demo features to rotate through for empty sections
    const demoPool = [
      {
        featureId: "css.media.prefers-color-scheme",
        name: "Dark Mode (prefers-color-scheme)",
      },
      { featureId: "css.properties.color-scheme", name: "CSS color-scheme" },
      {
        featureId: "css.custom-properties",
        name: "CSS Variables (Custom Properties)",
      },
      { featureId: "css.properties.grid", name: "CSS Grid Layout" },
      { featureId: "css.properties.flexbox", name: "CSS Flexbox" },
      {
        featureId: "css.properties.container-query",
        name: "CSS Container Queries",
      },
      { featureId: "css.properties.aspect-ratio", name: "CSS Aspect Ratio" },
      { featureId: "css.properties.display", name: "CSS Display Property" },
      {
        featureId: "js.syntax.optional-chaining",
        name: "Optional chaining (?.)",
      },
      { featureId: "js.syntax.top-level-await", name: "Top-level await" },
      { featureId: "api.fetch", name: "Fetch API" },
      { featureId: "api.service-worker", name: "Service Worker" },
      { featureId: "html.elements.dialog", name: "<dialog> element" },
      { featureId: "css.selectors.has", name: ":has() selector" },
      { featureId: "api.view-transitions", name: "View Transitions API" },
      { featureId: "css.functions.clamp", name: "CSS clamp()" },
    ];

    // Track features used across all sections to prevent duplicates
    const allUsedFeatureIds = new Set<string>();
    const allUsedFeatureNames = new Set<string>();

    console.log("🔍 Starting deduplication process...");

    // Enrich and ensure every section has at least two features
    plan.forEach((section: any, idx: number) => {
      console.log(`📋 Processing section ${idx + 1}: "${section.title}"`);

      const existing = Array.isArray(section.webFeatures)
        ? section.webFeatures
        : [];

      console.log(
        `  Raw features from AI:`,
        existing.map((f) => f.name)
      );

      // Enrich any existing with baseline and deduplicate by featureId AND name
      const enrichedExisting = existing
        .map((f: any) => {
          const byId = f.featureId
            ? getFeatureBaselineStatus(f.featureId)
            : undefined;
          const byName =
            !byId && f.name ? getFeatureBaselineByName(f.name) : undefined;
          const resolvedId =
            f.featureId ||
            (f.name ? resolveFeatureIdByName(f.name) : undefined);

          return {
            ...f,
            featureId: resolvedId || f.featureId,
            baseline: f.baseline ?? byId ?? byName,
          };
        })
        .filter((f: any) => {
          // Normalize the name for comparison
          const normalizedName = f.name.toLowerCase().trim();

          // Check for similar variations of the same feature
          const isVariationOfExisting = Array.from(allUsedFeatureNames).some(
            (existingName) => {
              // Check if names are very similar (handle common variations)
              return (
                normalizedName.includes(existingName) ||
                existingName.includes(normalizedName) ||
                // Check for common variations like "optional chaining" vs "optional chaining (?)"
                normalizedName
                  .replace(/[^\w\s]/g, "")
                  .includes(existingName.replace(/[^\w\s]/g, "")) ||
                existingName
                  .replace(/[^\w\s]/g, "")
                  .includes(normalizedName.replace(/[^\w\s]/g, ""))
              );
            }
          );

          // Skip if we've already used this feature ID, name, or a variation of it
          if (f.featureId && allUsedFeatureIds.has(f.featureId)) {
            console.log(
              `  ❌ Skipping duplicate ID: ${f.featureId} (${f.name})`
            );
            return false;
          }
          if (
            allUsedFeatureNames.has(normalizedName) ||
            isVariationOfExisting
          ) {
            console.log(`  ❌ Skipping duplicate/similar name: ${f.name}`);
            return false;
          }

          // Mark as used if we have a valid featureId or name
          if (f.featureId) {
            allUsedFeatureIds.add(f.featureId);
          }
          allUsedFeatureNames.add(normalizedName);
          console.log(
            `  ✅ Added feature: ${f.name} (ID: ${f.featureId || "none"})`
          );
          return true;
        });

      // If fewer than 2, top up with rotating demo features (avoiding duplicates)
      const needed = Math.max(0, 2 - enrichedExisting.length);
      console.log(
        `  📝 Need ${needed} more features for section "${section.title}"`
      );
      const fillers = [];

      for (let i = 0; i < needed; i++) {
        // Find next unused demo feature
        let attempts = 0;
        let pick;
        do {
          pick = demoPool[(idx + i + attempts) % demoPool.length];
          attempts++;
        } while (
          (allUsedFeatureIds.has(pick.featureId) ||
            allUsedFeatureNames.has(pick.name.toLowerCase().trim())) &&
          attempts < demoPool.length
        );

        const normalizedPickName = pick.name.toLowerCase().trim();
        if (
          !allUsedFeatureIds.has(pick.featureId) &&
          !allUsedFeatureNames.has(normalizedPickName)
        ) {
          allUsedFeatureIds.add(pick.featureId);
          allUsedFeatureNames.add(normalizedPickName);
          fillers.push({
            ...pick,
            baseline: getFeatureBaselineStatus(pick.featureId),
          });
          console.log(`  ➕ Added demo feature: ${pick.name}`);
        } else {
          console.log(
            `  🚫 Could not find unused demo feature after ${attempts} attempts`
          );
        }
      }

      section.webFeatures = [...enrichedExisting, ...fillers];
    });

    console.log("✅ Deduplication complete!");
    console.log(
      `📊 Total unique features used: ${allUsedFeatureIds.size} IDs, ${allUsedFeatureNames.size} names`
    );
    console.log(
      "🎉 Final plan:",
      plan.map((s) => `${s.title}: ${s.webFeatures?.length || 0} features`)
    );

    return plan;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof SyntaxError) {
      throw new Error(
        "Failed to parse the analysis from Gemini API. The response was not valid JSON."
      );
    }
    throw new Error("Failed to get analysis from Gemini API.");
  }
};

export const chatAboutImplementation = async (
  userMessage: string,
  implementationPlan: AnalysisSection[],
  previousMessages: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Build context about the implementation plan
  const planContext =
    implementationPlan.length > 0
      ? `\nCurrent Implementation Plan Context:\n${implementationPlan
          .map((section, idx) => {
            const features = section.webFeatures || [];
            const featureList =
              features.length > 0
                ? `\n  Web Features: ${features.map((f) => f.name).join(", ")}`
                : "";
            return `${idx + 1}. ${section.title}${featureList}`;
          })
          .join("\n")}\n`
      : "";

  // Build conversation history
  const conversationHistory =
    previousMessages.length > 0
      ? `\nPrevious Conversation:\n${previousMessages
          .map(
            (msg) =>
              `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
          )
          .join("\n")}\n`
      : "";

  const prompt = `You are a world-class senior frontend engineer and web platform expert helping with implementation questions.

${planContext}${conversationHistory}

User Question: ${userMessage}

Guidelines:
- If the user asks for a code example or prototype, generate a complete, production-ready code snippet (HTML, CSS, or JavaScript). For larger examples, you can provide a link to a pre-filled CodePen.
- If the user asks about browser support, reference baseline status and provide specific version information when relevant
- Be concise but thorough - aim for practical guidance over theoretical explanations
- If discussing web platform features, mention their baseline status (Baseline, Not Baseline, or Unknown) when relevant
- For implementation questions, suggest concrete code approaches or architectural patterns
- If the user asks about something not in the current plan, feel free to expand with relevant web platform knowledge
- Keep responses conversational and helpful
- Use Markdown for code blocks.

Respond in Markdown.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    const response = result.response.text().trim();
    return response;
  } catch (error) {
    console.error("Chat API call failed:", error);
    throw new Error("Failed to get response from AI chat service.");
  }
};

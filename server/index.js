import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// If a .env.local file exists in the project root, load simple KEY=VALUE pairs
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  try {
    const content = fs.readFileSync(envPath, "utf8");
    content.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)\s*$/);
      if (m) {
        const key = m[1];
        let value = m[2] || "";
        // strip surrounding quotes
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        process.env[key] = process.env[key] || value;
      }
    });
    console.log("Loaded .env.local");
  } catch (e) {
    console.warn("Failed to load .env.local", e);
  }
}

const PORT = process.env.PORT || 5174;

app.post("/api/generate-fallback", async (req, res) => {
  const { featureName, unsupportedBrowsers, baselineData } = req.body || {};
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "API_KEY or GEMINI_API_KEY not configured on server" });
  }

  try {
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
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`AI proxy server listening on port ${PORT}`);
});

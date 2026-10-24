import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

try {
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Reply with the single word: ok",
  });
  console.log("gemini-2.5-flash works:", res.text);
} catch (err) {
  console.log("gemini-2.5-flash failed:", err.message);
}

try {
  const names = [];
  const pager = await ai.models.list();
  for await (const m of pager) {
    if (m.name?.includes("flash")) names.push(m.name);
  }
  console.log("Flash models your key can see:\n" + names.join("\n"));
} catch (err) {
  console.log("Could not list models:", err.message);
}
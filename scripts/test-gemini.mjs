import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const models = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-flash-latest",
];

// 1x1 pixel PNG, only used to check that image input works
const png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const schema = {
  type: Type.OBJECT,
  properties: { status: { type: Type.STRING } },
  required: ["status"],
};

async function check(model, label, parts) {
  const start = Date.now();
  try {
    const res = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts }],
      config: { responseMimeType: "application/json", responseSchema: schema },
    });
    const parsed = JSON.parse(res.text);
    console.log(`PASS  ${model} | ${label} | ${Date.now() - start} ms | ${JSON.stringify(parsed)}`);
  } catch (err) {
    console.log(`FAIL  ${model} | ${label} | ${String(err.message).slice(0, 140)}`);
  }
}

for (const model of models) {
  await check(model, "text + schema", [{ text: "Return status ok." }]);
  await check(model, "image + schema", [
    { inlineData: { mimeType: "image/png", data: png } },
    { text: "Return status ok if you received an image." },
  ]);
}
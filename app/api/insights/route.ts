import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getFixturesCollection } from "@/lib/collections/fixtures";
import { getStatsCollection } from "@/lib/collections/stats";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    const fixturesCollection = await getFixturesCollection();
    const statsCollection = await getStatsCollection();

    const fixtures = await fixturesCollection
      .find({ status: "finished" })
      .sort({ date: -1 })
      .limit(3)
      .toArray();

    if (!fixtures.length) {
      return NextResponse.json({
        summary: "No finished games yet",
        mvp: "N/A",
        insights: ["Play some matches to generate insights"],
      });
    }

    const fixtureIds = fixtures.map((f) => f._id);

    const stats = await statsCollection
      .find({ fixtureId: { $in: fixtureIds } })
      .toArray();

    // 🔥 richer prompt (you asked for detailed homepage content)
    const prompt = `
Return ONLY valid JSON:

{
  "headline": "string",
  "summary": "string",
  "mvp": "string",
  "insights": ["string", "string", "string"],
  "matchNotes": ["string", "string"],
  "trending": ["string", "string", "string"]
}

You are a basketball analyst.

Fixtures:
${JSON.stringify(fixtures)}

Stats:
${JSON.stringify(stats)}
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) throw new Error("Empty Gemini response");

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const aiData = JSON.parse(cleaned);

    return NextResponse.json(aiData);
  } catch (error) {
    console.error("INSIGHTS ERROR:", error);

    return NextResponse.json({
      headline: "AI temporarily unavailable",
      summary: "Recent matches were competitive.",
      mvp: "N/A",
      insights: ["Try again later"],
      matchNotes: [],
      trending: [],
    });
  }
}
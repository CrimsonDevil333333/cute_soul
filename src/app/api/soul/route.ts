import { NextResponse } from "next/server";
import { generateSoulManifest, getStarterMoods, generateRandomSoul, generateCustomSoul } from "../../../lib/soul-engine";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get("mood");

  try {
    if (mood === "random") {
      const soul = generateRandomSoul();
      return NextResponse.json({ success: true, data: soul });
    }

    if (mood) {
      const moods = getStarterMoods();
      if (moods[mood]) {
        const soul = generateSoulManifest(moods[mood]);
        return NextResponse.json({ success: true, data: soul });
      }
      return NextResponse.json({ success: false, error: "Mood not found" }, { status: 404 });
    }

    // Return all available moods
    const allMoods = getStarterMoods();
    return NextResponse.json({ 
      success: true, 
      data: { 
        moods: Object.keys(allMoods).map(key => ({
          id: key,
          ...allMoods[key]
        }))
      } 
    });
  } catch (error) {
    console.error("Soul API Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    const soul = generateCustomSoul(prompt);

    return NextResponse.json({ success: true, data: soul });
  } catch (error) {
    console.error("Soul API Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSeasonCollection } from "@/lib/collections/season";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const collection = await getSeasonCollection();

    const season = {
      name: body.name,
      year: body.year,
      isActive: body.isActive ?? false,
      status: "upcoming",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(season);

    return NextResponse.json({
      success: true,
      seasonId: result.insertedId,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create season" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const collection = await getSeasonCollection();

    // 🔥 get active season
    const season = await collection.findOne({ isActive: true });

    if (!season) {
      return NextResponse.json({
        season: null,
      });
    }

    return NextResponse.json({
      season,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch season" },
      { status: 500 }
    );
  }
}
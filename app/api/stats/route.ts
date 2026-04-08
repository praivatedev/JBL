// /app/api/stats/route.ts
import { getFixturesCollection } from "@/lib/collections/fixtures";
import { getStatsCollection } from "@/lib/collections/stats";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// Define allowed stat types
type StatType = "points" | "assists" | "rebounds";

export async function POST(req: Request) {
  try {
    const { fixtureId, playerId, teamId, type, value = 1 }: { 
      fixtureId: string; 
      playerId: string; 
      teamId: string; 
      type: StatType; 
      value?: number; 
    } = await req.json();

    if (!fixtureId || !playerId || !teamId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const fixtureCollection = await getFixturesCollection();
    const statsCollection = await getStatsCollection();

    const fixtureObjectId = new ObjectId(fixtureId);
    const playerObjectId = new ObjectId(playerId);
    const teamObjectId = new ObjectId(teamId);

    // Prepare $inc object for dynamic stat update
    const update: { $inc: Record<StatType, number>; $setOnInsert: { teamId: ObjectId } } = {
      $inc: { points: 0, assists: 0, rebounds: 0 },
      $setOnInsert: { teamId: teamObjectId },
    };
    update.$inc[type] = value;

    // Update or insert player stat
    const updatedStat = await statsCollection!.findOneAndUpdate(
      { fixtureId: fixtureObjectId, playerId: playerObjectId },
      update,
      { upsert: true, returnDocument: "after" } // <-- Return the updated doc
    );

    // Update fixture total score if points
    if (type === "points") {
      const fixture = await fixtureCollection.findOne({ _id: fixtureObjectId });
      if (!fixture) return NextResponse.json({ error: "Fixture not found" }, { status: 404 });

      const isHome = fixture.homeTeamId.toString() === teamId;
      await fixtureCollection.updateOne(
        { _id: fixtureObjectId },
        {
          $inc: {
            homeScore: isHome ? value : 0,
            awayScore: !isHome ? value : 0,
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      stat: {
        playerId: updatedStat!.value?.playerId.toString(),
        teamId: updatedStat!.value?.teamId.toString(),
        points: updatedStat!.value?.points || 0,
        assists: updatedStat!.value?.assists || 0,
        rebounds: updatedStat!.value?.rebounds || 0
      }
    });
  } catch (error) {
    console.error("Stats POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fixtureId = searchParams.get("fixtureId");

    if (!fixtureId) 
      return NextResponse.json({ error: "Missing fixtureId" }, { status: 400 });

    // Validate ObjectId
    if (!ObjectId.isValid(fixtureId))
      return NextResponse.json({ error: "Invalid fixtureId" }, { status: 400 });

    const statsCol = await getStatsCollection();
    
    const stats = await statsCol.find({ fixtureId: new ObjectId(fixtureId) }).toArray();

    const formattedStats = stats.map(s => ({
      playerId: s.playerId.toString(),
      points: s.points ?? 0,
      assists: s.assists ?? 0,
      rebounds: s.rebounds ?? 0,
    }));

    return NextResponse.json(formattedStats, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch stats:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
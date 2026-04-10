import { getFixturesCollection } from "@/lib/collections/fixtures";
import { getStatsCollection } from "@/lib/collections/stats";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

type StatType = "points" | "assists" | "rebounds";

export async function POST(req: Request) {
  try {
    const {
      fixtureId,
      playerId,
      teamId,
      seasonId, // 🔥 IMPORTANT ADD
      type,
      value = 1,
    }: {
      fixtureId: string;
      playerId: string;
      teamId: string;
      seasonId: string;
      type: StatType;
      value?: number;
    } = await req.json();

    if (!fixtureId || !playerId || !teamId || !seasonId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const statsCollection = await getStatsCollection();
    const fixtureCollection = await getFixturesCollection();

    const fixtureObjectId = new ObjectId(fixtureId);
    const playerObjectId = new ObjectId(playerId);
    const teamObjectId = new ObjectId(teamId);
    const seasonObjectId = new ObjectId(seasonId);

    const update = {
      $inc: { points: 0, assists: 0, rebounds: 0 },
      $setOnInsert: {
        fixtureId: fixtureObjectId,
        playerId: playerObjectId,
        teamId: teamObjectId,
        seasonId: seasonObjectId, // 🔥 IMPORTANT
      },
    };

    update.$inc[type] = value;

    const result = await statsCollection.findOneAndUpdate(
      { fixtureId: fixtureObjectId, playerId: playerObjectId },
      update,
      { upsert: true, returnDocument: "after" }
    );

    const stat = result!.value;

    // 🔥 update score only if points
    if (type === "points") {
      const fixture = await fixtureCollection.findOne({ _id: fixtureObjectId });
      if (fixture) {
        const isHome = fixture.homeTeamId.toString() === teamId;

        await fixtureCollection.updateOne(
          { _id: fixtureObjectId },
          {
            $inc: {
              homeScore: isHome ? value : 0,
              awayScore: !isHome ? value : 0,
            },
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      stat: {
        playerId: stat?.playerId.toString(),
        fixtureId: stat?.fixtureId.toString(),
        teamId: stat?.teamId.toString(),
        seasonId: stat?.seasonId?.toString(),
        points: stat?.points || 0,
        assists: stat?.assists || 0,
        rebounds: stat?.rebounds || 0,
      },
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

    const statsCol = await getStatsCollection();

    // 🔥 HOME PAGE: return all stats
    if (!fixtureId) {
      const allStats = await statsCol.find({}).toArray();

      return NextResponse.json(
        allStats.map((s) => ({
          playerId: s.playerId?.toString(),
          fixtureId: s.fixtureId?.toString(),
          seasonId: s.seasonId?.toString(),
          points: s.points || 0,
          assists: s.assists || 0,
          rebounds: s.rebounds || 0,
        }))
      );
    }

    if (!ObjectId.isValid(fixtureId)) {
      return NextResponse.json({ error: "Invalid fixtureId" }, { status: 400 });
    }

    const stats = await statsCol.find({ fixtureId: new ObjectId(fixtureId) }).toArray();

    return NextResponse.json(
      stats.map((s) => ({
        playerId: s.playerId.toString(),
        points: s.points || 0,
        assists: s.assists || 0,
        rebounds: s.rebounds || 0,
      }))
    );
  } catch (err) {
    console.error("Failed to fetch stats:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
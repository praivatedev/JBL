import { getFixturesCollection } from "@/lib/collections/fixtures";
import { getPlayerCollection } from "@/lib/collections/player";
import { getTeamsCollection } from "@/lib/collections/teams";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid fixture ID" }, { status: 400 });

    const fixtureCol = await getFixturesCollection();
    const playersCol = await getPlayerCollection();
    const teamsCol = await getTeamsCollection();

    const fixture = await fixtureCol.findOne({ _id: new ObjectId(id) });
    if (!fixture) return NextResponse.json({ error: "Fixture not found" }, { status: 404 });

    // Fetch teams
    const [homeTeam, awayTeam] = await Promise.all([
      teamsCol.findOne({ _id: fixture.homeTeamId }),
      teamsCol.findOne({ _id: fixture.awayTeamId }),
    ]);

    // Fetch players separately
    const [homeTeamPlayers, awayTeamPlayers] = await Promise.all([
      playersCol
        .find({ teamId: fixture.homeTeamId })
        .project({ firstname: 1, lastname: 1 })
        .toArray(),
      playersCol
        .find({ teamId: fixture.awayTeamId })
        .project({ firstname: 1, lastname: 1 })
        .toArray(),
    ]);

    return NextResponse.json({
      data: {
        _id: fixture._id.toString(),
        homeTeamName: homeTeam?.name || "Unknown",
        awayTeamName: awayTeam?.name || "Unknown",
        homeTeamLogo: homeTeam?.logoUrl || "",
        awayTeamLogo: awayTeam?.logoUrl || "",
        homeTeamPlayers: homeTeamPlayers.map(p => ({ _id: p._id.toString(), name: `${p.firstname} ${p.lastname}`, teamId: fixture.homeTeamId.toString() })),
        awayTeamPlayers: awayTeamPlayers.map(p => ({ _id: p._id.toString(), name: `${p.firstname} ${p.lastname}`, teamId: fixture.awayTeamId.toString() })),
        status: fixture.status || "upcoming",
        homeScore: fixture.homeScore || 0,
        awayScore: fixture.awayScore || 0,
      }
    }, { status: 200 });

  } catch (err) {
    console.error("Failed to fetch fixture:", err);
    return NextResponse.json({ error: "Failed to fetch fixture" }, { status: 500 });
  }
}
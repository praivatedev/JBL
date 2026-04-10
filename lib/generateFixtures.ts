import { getTeamsCollection } from "./collections/teams";
import { getFixturesCollection } from "./collections/fixtures";
import { getSeasonCollection } from "./collections/season";
import { ObjectId } from "mongodb";

export async function generateFixtures() {
  const teamsCollection = await getTeamsCollection();
  const fixturesCollection = await getFixturesCollection();
  const seasonCollection = await getSeasonCollection();

  // 🔥 GET ACTIVE SEASON (FIXED)
  const season = await seasonCollection.findOne({ isActive: true });

  if (!season) {
    throw new Error("No active season found");
  }

  // ❌ Block if season already started
  if (season.status === "active") {
    throw new Error("Cannot add fixtures. Season already started.");
  }

  if (season.status === "completed") {
    throw new Error("Cannot generate fixtures. Season already completed.");
  }

  const teams = await teamsCollection.find().toArray();

  if (teams.length < 2) {
    return { insertedCount: 0 };
  }

  const matches = [];

  // 🔥 round-robin fixture generation
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        seasonId: season._id, // 🔥 IMPORTANT FIX

        homeTeamId: teams[i]._id,
        awayTeamId: teams[j]._id,

        homeScore: 0,
        awayScore: 0,

        date: null,
        status: "upcoming",

        createdAt: new Date(),
        updatedAt: new Date(),
      });

      matches.push({
        seasonId: season._id, // 🔥 IMPORTANT FIX

        homeTeamId: teams[j]._id,
        awayTeamId: teams[i]._id,

        homeScore: 0,
        awayScore: 0,

        date: null,
        status: "upcoming",

        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  console.log(`Generating ${matches.length} fixtures for season ${season.name}`);

  const result = await fixturesCollection.insertMany(matches);

  return {
    insertedCount: result.insertedCount,
  };
}
import { getTeamsCollection } from "./collections/teams";
import { getFixturesCollection } from "./collections/fixtures";
import { getSeasonCollection } from "./collections/season";

type Season = {
    status: "ended" | "ongoing"
}


export async function generateFixtures() {
    const teamsCollection = await getTeamsCollection();
    const fixturesCollection = await getFixturesCollection();

    const teams = await teamsCollection.find().toArray();

    const season = await getSeasonCollection ();

    if (!season) {
        throw new Error("No season found");
    }

    // ❌ Block if season already started
    if (season?.status === "ongoing") {
        throw new Error("Cannot add fixtures. Season already started.");
    }

    if (season?.status === "ended") {
        console.log("Generating fixtures.....");
    }

    if (teams.length < 2) {
        console.log("Not enough teams to generate fixtures.");
        return { insertedCount: 0 };
    }

    const matches = [];

    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            matches.push({

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

    console.log("Matches to insert:", matches);

    const fixtures = await fixturesCollection.insertMany(matches)
    console.log(fixtures.insertedCount);
    return fixtures;
}
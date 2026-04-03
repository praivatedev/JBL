import { getDb } from "../mongo/db";
import clientPromise from "../mongo/mongo";


export async function getFixturesCollection () {
    const db = await getDb()

    const collection = db.collection("fixtures");

    await collection.createIndex(
        { homeTeamId: 1, awayTeamId: 1 },
    );

    return db.collection("fixtures")
} 
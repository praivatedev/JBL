import { getDb } from "../mongo/db";

export async function getStatsCollection() {
    const db = await getDb();

    return db.collection("stats")
}

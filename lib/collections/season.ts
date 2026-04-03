import { getDb } from "../mongo/db";

export async function getSeasonCollection () {
    const db = await getDb()

        return db.collection("season").findOne()
}
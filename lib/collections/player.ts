import { getDb } from "../mongo/db";
import clientPromise from "../mongo/mongo";

export async function getPlayerCollection () {

    const db = await getDb()

    return db.collection("player")
}
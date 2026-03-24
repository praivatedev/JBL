import { getDb } from "@/lib/mongo/db";

export async function getTeamsCollection () {

    const db = await getDb()
    
    return db.collection("teams");
} 
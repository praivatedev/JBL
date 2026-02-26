import clientPromise from "@/lib/mongo/mongo";

export async function getTeamsCollection () {
    const client = await clientPromise

    const db = client.db("mydb")
    
    return db.collection("teams");
} 
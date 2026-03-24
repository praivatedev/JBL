import clientPromise from "./mongo";


export async function getDb () {
    const client = await clientPromise;
    return client.db("mydb")
}
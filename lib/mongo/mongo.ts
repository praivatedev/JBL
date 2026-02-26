import { MongoClient, ServerApiVersion } from "mongodb";
import { version } from "os";
const uri = process.env.MONGO_URI

if(!uri) throw new Error("Mongo uri is not provided!!")

const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined
}

if(!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise;


export default clientPromise;
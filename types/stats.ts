import { ObjectId } from "mongodb"

type Playerstats = {
    _id: ObjectId,

    playerId: ObjectId,
    fixtureId: ObjectId,
    teamId: ObjectId,

    type: "points" | "assists" | "rebounds"
    value: number,

    createdAt: Date
}
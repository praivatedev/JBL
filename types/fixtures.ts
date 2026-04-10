import { ObjectId } from "mongodb";


export type fixtures = {
    _id: ObjectId;

    seasonId: ObjectId;

    homeTeamId: ObjectId;
    awayTeamId: ObjectId;

    homeScore: number | null;
    awayScore: number | null;

    date: Date;

    status: "upcoming" | "ongoing" | "finished"

    createdAt: Date;
    updatedAt: Date;
}
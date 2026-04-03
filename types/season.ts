import { ObjectId } from "mongodb"

type Season = {
    _id: ObjectId;
    status: "ongoing" | "ended";
    name: string,
    createdAt: Date;
    updatedAt: Date;
};

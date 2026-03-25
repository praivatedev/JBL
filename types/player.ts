import { ObjectId } from "mongodb";

export type Player = {
_id?: ObjectId;

teamId: ObjectId;
firstname: string;
lastname: string;

age: number;
height?: number;
weight?: number;

position: "shooting-guard" |"point-guard" | "small-forward" | "power-forward" | "center"
jerseyNumber: number

isActive?: boolean;

imgUrl?: string;

createdAt?: Date;
updatedAt?: Date;
}
import { ObjectId } from "mongodb";

export type Team = {
  _id?: ObjectId;
  name: string;
  logoUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
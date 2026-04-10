import { ObjectId } from "mongodb"

type Season = {
  _id?: ObjectId;

  name: string; 
  // e.g. "2026 Season", "Season 1", "Spring League 2026"

  year: number; 
  // e.g. 2026

  isActive: boolean; 
  // only ONE season should be active at a time

  startDate?: Date;
  endDate?: Date;

  status: "upcoming" | "active" | "completed";

  createdAt?: Date;
  updatedAt?: Date;
};
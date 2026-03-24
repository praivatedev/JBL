import { getPlayerCollection } from "@/lib/collections/player";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            teamId,
            firstname,
            lastname,
            age,
            height,
            weight,
            position,
            jerseyNumber,
            isActive,
            imgUrl
        } = body

        if (!firstname || !lastname || !age || !teamId || !position || !jerseyNumber)
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 });

        const players = await getPlayerCollection()

        const newPlayer = {
            teamId: new ObjectId(teamId),
            firstname,
            lastname,
            age: Number(age),
            height: Number(height),
            weight: Number(weight),
            position,
            jerseyNumber: Number(jerseyNumber),
            isActive,
            imgUrl
        };

        const result = await players.insertOne(newPlayer)

        return NextResponse.json(
            {
                success: "Player added successfully",
                teamId: result.insertedId,

            },
            { status: 201 }
        )
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to create player" },
            { status: 500 }
        );
    }
}



import { NextResponse } from "next/server";
import { getTeamsCollection } from "@/models/teams";

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, logoUrl } = body


        console.log("Request Body:", body)

        if (!name || !logoUrl) {
            return NextResponse.json(
                { error: "All fields are required!!" },
                { status: 400 }
            )
        }

        const teams = await getTeamsCollection()

        const result = await teams.insertOne({
            ...body,
            createdAt: new Date()
        })

        return NextResponse.json(
            { success: "Team added successfully!!" },
            { status: 201 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: "Something went wrong!!" },
            { status: 500 }
        )
    }
}


export async function GET() {
    try {
        const teams = await getTeamsCollection()

        const data = await teams.find().sort({createdAt: -1}).toArray()

        return NextResponse.json(data, {status: 200})
    } catch(error) {
        NextResponse.json(
            {error: "Something went wrong!!"},
            {status: 500}
        )
    }
} 
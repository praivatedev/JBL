import { NextResponse } from "next/server";
import { generateFixtures } from "@/lib/generateFixtures";
import { getFixturesCollection } from "@/lib/collections/fixtures";
import { lookup } from "dns";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
    try {
        const fixtures = await generateFixtures()

        return NextResponse.json(
            { success: `${fixtures.insertedCount} Fixtures were successfully created` },
            { status: 201 }
        )
    } catch (error) {
        console.log("FULL ERROR:", error)
        return NextResponse.json(
            { error: "Failed to add matches" },
            { status: 500 }
        )        
    }
}

export async function GET(req: Request) {
    try {
        const collection = await getFixturesCollection()

        const data = await collection.aggregate([
            {
                $addFields: {
                    homeTeamIdObj: { $toObjectId: "$homeTeamId" },
                    awayTeamIdObj: { $toObjectId: "$awayTeamId" }
                }
            },
            {
                $lookup: {
                    from: "teams",
                    localField: "homeTeamIdObj",
                    foreignField: "_id",
                    as: "homeTeam"
                }
            },
            {
                $lookup: {
                    from: "teams",
                    localField: "awayTeamIdObj",
                    foreignField: "_id",
                    as: "awayTeam"
                }
            },
            { $unwind: "$homeTeam" },
            { $unwind: "$awayTeam" },
            {
                $project: {
                    date: 1,
                    status: 1,
                    homeTeamName: "$homeTeam.name",
                    homeTeamLogo: "$homeTeam.logoUrl",
                    awayTeamName: "$awayTeam.name",
                    awayTeamLogo: "$awayTeam.logoUrl",
                }
            }
        ]).toArray()

        return NextResponse.json(
            { data },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: error },
            { status: 500 }
        )
    }
}

export async function PATCH (req: Request) {
    try{
        const {fixtureId, date, time} = await req.json()

        if (!fixtureId || !date) {
            return NextResponse.json(
                {error: "FixtureId and date are required!!" },
                {status: 400}
            )
        };

        const collection = await getFixturesCollection()

         const combinedDate = new Date(`${date}T${time}`);

        const result = await collection.updateOne(
            {_id: new ObjectId(fixtureId)},
                {
                    $set: {
                        date: combinedDate,
                        UpdatedAt: new Date
                    }
                }
            
        )

        if(result.matchedCount === 0){
            return NextResponse.json(
                {error: "Fixture not found!!"},
                {status: 404}
            )
        }

        return NextResponse.json(
            {success: "Fixture updated successfully"},
            {status: 200}
        )


    } catch(error) {
        console.log("PATH ERROR", error)
        return NextResponse.json(
            {error: error},
            {status: 500}
        )
    }
}
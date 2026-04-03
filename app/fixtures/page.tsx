"use client"
import { useEffect, useState } from "react"
import { formatFixtureDate } from "@/lib/utils/formatFixtureDate";

type Fixture = {
    _id: string;
    date: string;
    status: "upcoming" | "ongoing" | "finished";
    homeTeamName: string;
    awayTeamName: string;
    homeTeamLogo: string;
    awayTeamLogo: string;
};

export default function Fixtures() {
    const [fixtures, setFixtures] = useState<Fixture[]>([])
    useEffect(() => {
        async function fetchFixtures() {
            const res = await fetch("/api/fixtures")

            const fixtures = await res.json()
            setFixtures(fixtures.data || [])
        }
        fetchFixtures()
    }, [])
    if (!fixtures || fixtures.length === 0)
        return (<p className="p-4 text-gray-500 text-center">
            No fixtures found in the database.
        </p>)
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Fixtures</h2>

            {/* Grid container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                {fixtures.map((fixture) => (
                    <div
                        key={fixture._id}
                        className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-2xl hover:shadow-xl transition-shadow duration-300 w-full max-w-xs"
                    >
                        {/* Teams */}
                        <div className="flex items-center justify-between w-full mb-4">
                            {/* Home Team */}
                            <div className="flex flex-col items-center gap-2">
                                <img
                                    src={fixture.homeTeamLogo}
                                    alt={fixture.homeTeamName}
                                    className="w-16 h-16 rounded-full border-2 border-blue-400 object-cover"
                                />
                                <span className="font-semibold text-base text-blue-600 text-center max-w-[70px]">
                                    {fixture.homeTeamName}
                                </span>
                            </div>

                            {/* VS */}
                            <span className="font-bold text-gray-500 text-base mx-2">vs</span>

                            {/* Away Team */}
                            <div className="flex flex-col items-center gap-2">
                                <img
                                    src={fixture.awayTeamLogo}
                                    alt={fixture.awayTeamName}
                                    className="w-16 h-16 rounded-full border-2 border-red-400 object-cover"
                                />
                                <span className="font-semibold text-base text-red-600 text-center max-w-[70px]">
                                    {fixture.awayTeamName}
                                </span>
                            </div>
                        </div>

                        <div className="font-semibold">
                            {formatFixtureDate(fixture.date)}
                        </div>

                        {/* Match Status */}
                        <span
                            className={`px-4 py-2 rounded-full text-sm font-medium font-semibold ${fixture.status === "upcoming"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : fixture.status === "ongoing"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-200 text-gray-700"
                                }`}
                        >
                            {fixture.status.toUpperCase()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// export type fixtures = {
//     _id: ObjectId;

//     homeTeamId: ObjectId;
//     awayTeamId: ObjectId;

//     homeScore: number | null;
//     awayScore: number | null;

//     date: Date;

//     status: "upcoming" | "ongoing" | "finished"

//     createdAt: Date;
//     updatedAt: Date;
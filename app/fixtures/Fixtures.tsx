"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatFixtureDate } from "@/lib/utils/formatFixtureDate"; // make sure path is correct

type Fixture = {
  _id: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  status: "upcoming" | "ongoing" | "finished";
  date: string; // ISO string
};

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const res = await fetch("/api/fixtures");
        const data = await res.json();
        setFixtures(data.data || []);
      } catch (err) {
        console.error("Failed to fetch fixtures", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFixtures();
  }, []);

  if (loading) return <p className="text-center py-10">Loading fixtures...</p>;
  if (fixtures.length === 0) return <p className="text-center py-10">No fixtures found</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Fixtures</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {fixtures.map((fixture) => {
          const formattedDate = formatFixtureDate(fixture.date);

          return (
            <div
              key={fixture._id}
              onClick={() => router.push(`/fixtures/${fixture._id}`)}
              className="flex flex-col items-center p-4 border rounded-lg shadow hover:shadow-lg cursor-pointer transition bg-white"
            >
              <div className="flex items-center gap-4 mb-2">
                {/* Home Team */}
                <div className="flex flex-col items-center">
                  {fixture.homeTeamLogo && (
                    <img
                      src={fixture.homeTeamLogo}
                      alt={fixture.homeTeamName}
                      className="w-12 h-12 object-contain mb-1"
                    />
                  )}
                  <span className="text-sm font-semibold text-center">{fixture.homeTeamName}</span>
                </div>

                <span className="text-xl font-bold">vs</span>

                {/* Away Team */}
                <div className="flex flex-col items-center">
                  {fixture.awayTeamLogo && (
                    <img
                      src={fixture.awayTeamLogo}
                      alt={fixture.awayTeamName}
                      className="w-12 h-12 object-contain mb-1"
                    />
                  )}
                  <span className="text-sm font-semibold text-center">{fixture.awayTeamName}</span>
                </div>
              </div>

              {/* Formatted Date */}
              <div className="text-xs text-gray-500 mb-1">{formattedDate}</div>

              {/* Status */}
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  fixture.status === "upcoming"
                    ? "bg-yellow-100 text-yellow-800"
                    : fixture.status === "ongoing"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {fixture.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
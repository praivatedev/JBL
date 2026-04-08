"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatFixtureDate } from "@/lib/utils/formatFixtureDate";
import { Calendar, Clock } from "lucide-react";

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

  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading fixtures...</p>;

  if (fixtures.length === 0)
    return <p className="text-center py-10 text-gray-500">No fixtures found</p>;

  return (
    <div className="p-6 max- mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Upcoming Fixtures</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {fixtures.map((fixture) => {
          const formattedDate = formatFixtureDate(fixture.date);

          // Handle time; if missing, show TBD
          let formattedTime = "TBD";
          if (fixture.date) {
            const dateObj = new Date(fixture.date);
            const hasTime =
              dateObj.getHours() !== 0 || dateObj.getMinutes() !== 0;

            if (hasTime) {
              formattedTime = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
            }
          }

          return (
            <div
              key={fixture._id}
              onClick={() => router.push(`/stats/${fixture._id}`)}
              className="flex flex-col justify-between p-6 border rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer bg-gradient-to-b from-white via-gray-50 to-white"
            >
              {/* Top row: Date & Time */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                  <Calendar size={16} />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Clock size={16} />
                  <span className={formattedTime === "TBD" ? "text-gray-400 italic" : ""}>
                    {formattedTime}
                  </span>
                </div>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between mb-4">
                {/* Home */}
                <div className="flex flex-col items-center">
                  {fixture.homeTeamLogo ? (
                    <img
                      src={fixture.homeTeamLogo}
                      alt={fixture.homeTeamName}
                      className="w-16 h-16 object-cover rounded-full shadow-sm mb-2 border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-gray-400">
                      N/A
                    </div>
                  )}
                  <span className="text-sm font-semibold text-center text-gray-800">
                    {fixture.homeTeamName}
                  </span>
                </div>

                {/* VS */}
                <div className="text-lg font-bold text-gray-500">vs</div>

                {/* Away */}
                <div className="flex flex-col items-center">
                  {fixture.awayTeamLogo ? (
                    <img
                      src={fixture.awayTeamLogo}
                      alt={fixture.awayTeamName}
                      className="w-16 h-16 object-cover rounded-full shadow-sm mb-2 border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-gray-400">
                      N/A
                    </div>
                  )}
                  <span className="text-sm font-semibold text-center text-gray-800">
                    {fixture.awayTeamName}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-center mt-auto">
                <span
                  className={`text-xs px-4 py-1 rounded-full ${
                    fixture.status === "upcoming"
                      ? "bg-yellow-100 text-yellow-800"
                      : fixture.status === "ongoing"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {fixture.status.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
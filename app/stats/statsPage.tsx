"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type PlayerStat = { playerId: string; points: number; assists: number; rebounds: number };
type Player = { _id: string; name: string; teamId: string };
type Team = { _id: string; name: string; logoUrl: string };

type FixtureData = {
  homeTeam: Team;
  awayTeam: Team;
  homePlayers: Player[];
  awayPlayers: Player[];
  stats: PlayerStat[];
  homeScore: number;
  awayScore: number;
  status: "upcoming" | "ongoing" | "finished";
};

export default function FixtureStatsPage() {
  const params = useParams();
  const fixtureId = params?.fixtureId as string;

  const [data, setData] = useState<FixtureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fixtureId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/fixtures/${fixtureId}`);
        const fixtureJson = await res.json();
        if (!res.ok) throw new Error(fixtureJson.error || "Failed to fetch fixture");

        const statsRes = await fetch(`/api/stats?fixtureId=${fixtureId}`);
        const statsData: PlayerStat[] = await statsRes.json();

        setData({
          homeTeam: {
            _id: String(fixtureJson.data.homeTeamId),
            name: fixtureJson.data.homeTeamName,
            logoUrl: fixtureJson.data.homeTeamLogo,
          },
          awayTeam: {
            _id: String(fixtureJson.data.awayTeamId),
            name: fixtureJson.data.awayTeamName,
            logoUrl: fixtureJson.data.awayTeamLogo,
          },
          homePlayers: fixtureJson.data.homeTeamPlayers || [],
          awayPlayers: fixtureJson.data.awayTeamPlayers || [],
          stats: statsData.map((s: any) => ({
            playerId: String(s.playerId),
            points: s.points || 0,
            assists: s.assists || 0,
            rebounds: s.rebounds || 0,
          })),
          homeScore: fixtureJson.data.homeScore || 0,
          awayScore: fixtureJson.data.awayScore || 0,
          status: fixtureJson.data.status || "upcoming",
        });
      } catch (err: any) {
        setError(err.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fixtureId]);

  if (!fixtureId) return <p className="text-center py-10 text-red-600">Invalid fixture ID</p>;
  if (loading) return <p className="text-center py-10 text-gray-500">Loading stats...</p>;
  if (error) return <p className="text-center py-10 text-red-600">{error}</p>;
  if (!data) return <p className="text-center py-10 text-gray-500">No data found</p>;

  const getStat = (playerId: string) =>
    data.stats.find(s => s.playerId === playerId) || { points: 0, assists: 0, rebounds: 0 };

  const maxPoints = Math.max(...data.stats.map(s => s.points), 1);

  const renderPlayers = (players: Player[], team: Team) => {
    if (players.length === 0) {
      return <p className="text-center text-gray-400">No players</p>;
    }

    return (
      <div className="space-y-2">
        {players.map(player => {
          const stat = getStat(player._id);
          const isTop = stat.points === maxPoints && maxPoints > 0;

          return (
            <div
              key={player._id}
              className={`flex justify-between items-center p-3 rounded-lg shadow-sm border ${
                isTop ? "border-yellow-400 bg-yellow-50" : "bg-white"
              }`}
            >
              {/* Player */}
              <div className="flex items-center gap-3">
                <img src={team.logoUrl} className="w-8 h-8 rounded-full" />
                <span className="font-medium">{player.name}</span>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-sm font-semibold">
                <span>🏀 {stat.points}</span>
                <span>🤝 {stat.assists}</span>
                <span>🔄 {stat.rebounds}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* 🔥 SCOREBOARD */}
      <div className="sticky top-0 bg-white z-10 shadow rounded-xl p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={data.homeTeam.logoUrl} className="w-10 h-10 rounded-full" />
          <span className="font-bold">{data.homeTeam.name}</span>
        </div>

        <div className="text-2xl font-extrabold flex gap-4">
          <span>{data.homeScore}</span>
          <span className="text-gray-400">-</span>
          <span>{data.awayScore}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold">{data.awayTeam.name}</span>
          <img src={data.awayTeam.logoUrl} className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* STATUS */}
      <div className="flex justify-center">
        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
          data.status === "ongoing"
            ? "bg-green-100 text-green-700"
            : data.status === "upcoming"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-gray-200 text-gray-700"
        }`}>
          {data.status.toUpperCase()}
        </span>
      </div>

      {/* 🔥 TWO COLUMN TEAM VIEW */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* HOME */}
        <div>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <img src={data.homeTeam.logoUrl} className="w-6 h-6 rounded-full" />
            {data.homeTeam.name}
          </h2>
          {renderPlayers(data.homePlayers, data.homeTeam)}
        </div>

        {/* AWAY */}
        <div>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <img src={data.awayTeam.logoUrl} className="w-6 h-6 rounded-full" />
            {data.awayTeam.name}
          </h2>
          {renderPlayers(data.awayPlayers, data.awayTeam)}
        </div>

      </div>
    </div>
  );
}
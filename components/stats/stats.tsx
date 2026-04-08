"use client";
import { useState, useEffect } from "react";

type Player = { _id: string; name: string; teamId: string };
type Fixture = {
  _id: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
  homeScore: number;
  awayScore: number;
  status: "upcoming" | "ongoing" | "finished";
};

type PlayerStat = { playerId: string; points: number; assists: number; rebounds: number };
type Props = { fixtureId: string };

export default function FixtureStats({ fixtureId }: Props) {
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fixtureId || fixtureId.length !== 24) {
      setError("Invalid fixture ID");
      setLoading(false);
      return;
    }

    const fetchFixture = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/fixtures/${fixtureId}`);
        const data = await res.json();
        console.log("Fetched Fixture:", data);

        if (!res.ok) throw new Error(data.error || "Failed to fetch fixture");

        const fixtureData: Fixture = {
          ...data.data,
          homeScore: data.data.homeScore ?? 0,
          awayScore: data.data.awayScore ?? 0,
          homeTeamPlayers: data.data.homeTeamPlayers || [],
          awayTeamPlayers: data.data.awayTeamPlayers || [],
        };
        setFixture(fixtureData);

        const stats: PlayerStat[] = [
          ...fixtureData.homeTeamPlayers,
          ...fixtureData.awayTeamPlayers,
        ].map(p => ({ playerId: p._id, points: 0, assists: 0, rebounds: 0 }));

        setPlayerStats(stats);
      } catch (err: any) {
        setError(err.message || "Failed to fetch fixture");
      } finally {
        setLoading(false);
      }
    };

    fetchFixture();
  }, [fixtureId]);

  const getPlayerStat = (playerId: string) =>
    playerStats.find(p => p.playerId === playerId) || { points: 0, assists: 0, rebounds: 0 };

  const updateStat = async (playerId: string, type: "points" | "assists" | "rebounds", value: number = 1) => {
    setPlayerStats(prev =>
      prev.map(p => p.playerId === playerId ? { ...p, [type]: p[type] + value } : p)
    );

    setFixture(prev => {
      if (!prev) return prev;
      if (type === "points") {
        const isHome = prev.homeTeamPlayers.some(p => p._id === playerId);
        return {
          ...prev,
          homeScore: isHome ? prev.homeScore + value : prev.homeScore,
          awayScore: !isHome ? prev.awayScore + value : prev.awayScore,
        };
      }
      return prev;
    });

    try {
      const player = fixture?.homeTeamPlayers.find(p => p._id === playerId)
        || fixture?.awayTeamPlayers.find(p => p._id === playerId);
      if (!player || !fixture) return;

      await fetch(`/api/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fixtureId,
          playerId,
          teamId: player.teamId,
          type,
          value,
        }),
      });
    } catch (err) {
      console.error("Failed to update stat", err);
    }
  };

  if (loading) return <p className="text-center py-10">Loading fixture...</p>;
  if (error) return <p className="text-center py-10 text-red-600">{error}</p>;
  if (!fixture) return <p className="text-center py-10">No fixture found</p>;

  const teams = [
    { name: fixture.homeTeamName, logo: fixture.homeTeamLogo, players: fixture.homeTeamPlayers, color: "blue", total: fixture.homeScore },
    { name: fixture.awayTeamName, logo: fixture.awayTeamLogo, players: fixture.awayTeamPlayers, color: "red", total: fixture.awayScore },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <img src={fixture.homeTeamLogo} alt={fixture.homeTeamName} className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover" />
          <h2 className="text-2xl font-bold text-center">{fixture.homeTeamName} vs {fixture.awayTeamName}</h2>
          <img src={fixture.awayTeamLogo} alt={fixture.awayTeamName} className="w-12 h-12 rounded-full border-2 border-red-500 object-cover" />
        </div>
        <span className={`mt-2 px-4 py-1 rounded-full text-sm font-semibold ${
          fixture.status === "upcoming" ? "bg-yellow-100 text-yellow-800" :
          fixture.status === "ongoing" ? "bg-green-100 text-green-800" :
          "bg-gray-200 text-gray-700"
        }`}>
          {fixture.status.toUpperCase()}
        </span>
      </div>

      {/* Team Scores */}
      <div className="flex justify-center gap-12">
        {teams.map((team, i) => (
          <div key={i} className="text-center w-44">
            <h3 className="font-semibold mb-1">{team.name}</h3>
            <p className="text-xl font-bold mb-2">{team.total} pts</p>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-4 rounded-full bg-${team.color}-500 transition-all duration-300`}
                style={{ width: `${(team.total / Math.max(fixture.homeScore, fixture.awayScore, 1)) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Players */}
      <div className="flex flex-col md:flex-row gap-6">
        {teams.map((team, i) => (
          <div key={i} className={`flex-1 bg-${team.color}-50 rounded-lg shadow p-4`}>
            <h3 className="flex items-center gap-2 mb-4 font-bold text-lg">
              <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-full border-2 border-current object-cover" />
              {team.name}
            </h3>

            {team.players.length === 0 ? (
              <p className="text-gray-500 text-center">No players added yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {team.players.map(player => {
                  const stats = getPlayerStat(player._id);
                  return (
                    <div key={player._id} className="flex flex-col md:flex-row items-center justify-between p-3 bg-white rounded-lg border shadow-sm gap-2">
                      <div className="font-medium">{player.name}</div>
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => updateStat(player._id, "points", 1)} className="px-2 py-1 bg-yellow-200 rounded hover:bg-yellow-300 transition">+1</button>
                        <button onClick={() => updateStat(player._id, "points", 2)} className="px-2 py-1 bg-yellow-300 rounded hover:bg-yellow-400 transition">+2</button>
                        <button onClick={() => updateStat(player._id, "points", 3)} className="px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500 transition">+3</button>
                        <button onClick={() => updateStat(player._id, "assists")} className="px-2 py-1 bg-green-200 rounded hover:bg-green-300 transition">A:{stats.assists}</button>
                        <button onClick={() => updateStat(player._id, "rebounds")} className="px-2 py-1 bg-blue-200 rounded hover:bg-blue-300 transition">R:{stats.rebounds}</button>
                      </div>
                      <div className="font-semibold text-gray-700">{stats.points} pts</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
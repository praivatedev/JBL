"use client";

import { useState, useEffect } from "react";
import { FaBasketballBall, FaHandPaper, FaRedo, FaUserSlash } from "react-icons/fa";

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
        // Fetch fixture
        const res = await fetch(`/api/fixtures/${fixtureId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch fixture");

        const fixtureData: Fixture = {
          ...data.data,
          homeScore: data.data.homeScore ?? 0,
          awayScore: data.data.awayScore ?? 0,
          homeTeamPlayers: data.data.homeTeamPlayers || [],
          awayTeamPlayers: data.data.awayTeamPlayers || [],
        };
        setFixture(fixtureData);

        // Fetch stats from DB
        const statsRes = await fetch(`/api/stats?fixtureId=${fixtureId}`);
        const statsData: PlayerStat[] = await statsRes.json();

        // Merge DB stats with players
        const stats: PlayerStat[] = [
          ...fixtureData.homeTeamPlayers,
          ...fixtureData.awayTeamPlayers,
        ].map(p => {
          const dbStat = statsData.find(s => s.playerId === p._id);
          return {
            playerId: p._id,
            points: dbStat?.points ?? 0,
            assists: dbStat?.assists ?? 0,
            rebounds: dbStat?.rebounds ?? 0,
          };
        });

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

  if (loading) return <p className="text-center py-10 text-gray-500">Loading fixture...</p>;
  if (error) return <p className="text-center py-10 text-red-600">{error}</p>;
  if (!fixture) return <p className="text-center py-10 text-gray-500">No fixture found</p>;

  const teams = [
    { name: fixture.homeTeamName, logo: fixture.homeTeamLogo, players: fixture.homeTeamPlayers, color: "#3b82f6", total: fixture.homeScore },
    { name: fixture.awayTeamName, logo: fixture.awayTeamLogo, players: fixture.awayTeamPlayers, color: "#ef4444", total: fixture.awayScore },
  ];

  const maxScore = Math.max(fixture.homeScore, fixture.awayScore, 1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-center items-center gap-6 sticky top-0 bg-white z-10 p-4 rounded shadow">
        <div className="flex items-center gap-3">
          <img src={fixture.homeTeamLogo} className="w-12 h-12 rounded-full" />
          <span className="font-bold text-lg">{fixture.homeTeamName}</span>
          <span className="text-2xl font-extrabold">{fixture.homeScore}</span>
        </div>
        <span className="font-bold text-xl">vs</span>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold">{fixture.awayScore}</span>
          <span className="font-bold text-lg">{fixture.awayTeamName}</span>
          <img src={fixture.awayTeamLogo} className="w-12 h-12 rounded-full" />
        </div>
      </div>

      {/* Status */}
      <div className="flex justify-center">
        <span className={`px-4 py-2 rounded-full font-semibold ${
          fixture.status === "upcoming" ? "bg-yellow-100 text-yellow-800" :
          fixture.status === "ongoing" ? "bg-green-100 text-green-800" :
          "bg-gray-200 text-gray-700"
        }`}>
          {fixture.status.toUpperCase()}
        </span>
      </div>

      {/* Team Score Cards */}
      <div className="flex flex-wrap gap-6 justify-center">
        {teams.map(team => (
          <div key={team.name} className="flex-1 min-w-[300px] max-w-md flex items-center p-4 bg-white rounded-xl shadow-md gap-4">
            <img src={team.logo} alt={team.name} className="w-16 h-16 rounded-full border-2 border-gray-200 object-cover" />
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{team.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold">{team.total} pts</span>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(team.total / maxScore) * 100}%`, backgroundColor: team.color }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Player Stats */}
      <div className="flex flex-wrap gap-6 justify-center">
        {teams.map(team => (
          <div key={team.name} className="flex-1 min-w-[300px] max-w-md space-y-3">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <img src={team.logo} className="w-8 h-8 rounded-full" />
              {team.name}
            </h4>
            {team.players.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg text-gray-400 animate-pulse">
                <FaUserSlash className="text-4xl" />
                <p className="text-center font-semibold">No players added yet</p>
                <p className="text-sm text-gray-500">Check back later or add players in the dashboard.</p>
              </div>
            ) : (
              team.players.map(player => {
                const stats = getPlayerStat(player._id);
                return (
                  <div key={player._id} className="p-3 bg-white rounded-lg shadow flex justify-between items-center gap-2 hover:shadow-lg transition">
                    <div className="flex-1">
                      <div className="font-medium">{player.name}</div>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {[1, 2, 3].map(val => (
                          <button key={val} onClick={() => updateStat(player._id,"points",val)}
                            className={`flex items-center gap-1 px-2 py-1 rounded bg-yellow-${200 + (val-1)*100} hover:bg-yellow-${300 + (val-1)*100}`}>
                            <FaBasketballBall /> +{val}
                          </button>
                        ))}
                        <button onClick={() => updateStat(player._id,"assists")}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-green-200 hover:bg-green-300">
                          <FaHandPaper /> {stats.assists}
                        </button>
                        <button onClick={() => updateStat(player._id,"rebounds")}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-blue-200 hover:bg-blue-300">
                          <FaRedo /> {stats.rebounds}
                        </button>
                      </div>
                    </div>
                    <div className="font-semibold text-lg">{stats.points} pts</div>
                  </div>
                );
              })
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
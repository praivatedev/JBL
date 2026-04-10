"use client";

import { useEffect, useState } from "react";

type Fixture = {
  _id: string;
  seasonId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  homeScore: number;
  awayScore: number;
  status: string;
};

type Stat = {
  playerId: string;
  fixtureId: string;
  seasonId: string;
  points: number;
  assists: number;
  rebounds: number;
};

type Player = {
  _id: string;
  firstname: string;
  lastname: string;
  imgUrl?: string;
};

type Season = {
  _id: string;
  name: string;
  year: number;
  isActive: boolean;
};

export default function Home() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [fRes, sRes, pRes, seRes] = await Promise.all([
        fetch("/api/fixtures"),
        fetch("/api/stats"),
        fetch("/api/player"),
        fetch("/api/season"),
      ]);

      const fData = await fRes.json();
      const sData = await sRes.json();
      const pData = await pRes.json();
      const seData = await seRes.json();

      setFixtures(fData.data || []);
      setStats(sData || []);
      setPlayers(pData || []);
      setSeason(seData?.season || null);

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading {season?.name || "League"}...
      </div>
    );
  }

  const seasonFixtures = fixtures.filter((f) => f.seasonId === season?._id);
  const finished = seasonFixtures.filter((f) => f.status === "finished");

  /* ---------------- TEAM STATS ---------------- */
  const teamMap = new Map<string, { wins: number; losses: number; logo?: string }>();

  finished.forEach((f) => {
    if (!teamMap.has(f.homeTeamName)) {
      teamMap.set(f.homeTeamName, { wins: 0, losses: 0, logo: f.homeTeamLogo });
    }
    if (!teamMap.has(f.awayTeamName)) {
      teamMap.set(f.awayTeamName, { wins: 0, losses: 0, logo: f.awayTeamLogo });
    }

    if (f.homeScore > f.awayScore) {
      teamMap.get(f.homeTeamName)!.wins++;
      teamMap.get(f.awayTeamName)!.losses++;
    } else {
      teamMap.get(f.awayTeamName)!.wins++;
      teamMap.get(f.homeTeamName)!.losses++;
    }
  });

  const teams = Array.from(teamMap.entries()).map(([name, v]) => ({
    name,
    ...v,
  }));

  /* ---------------- PLAYER STATS ---------------- */
  const playerTotals: Record<string, number> = {};
  const seasonStats = stats.filter((s) => s.seasonId === season?._id);

  seasonStats.forEach((s) => {
    const score = (s.points || 0) + (s.assists || 0) * 2 + (s.rebounds || 0) * 1.5;
    playerTotals[s.playerId] = (playerTotals[s.playerId] || 0) + score;
  });

  const topPlayers = Object.entries(playerTotals)
    .map(([id, total]) => {
      const p = players.find((pl) => pl._id === id);
      return {
        id,
        name: p ? `${p.firstname} ${p.lastname}` : "Unknown Player",
        img: p?.imgUrl,
        total,
      };
    })
    .sort((a, b) => b.total - a.total);

  const mvp = topPlayers[0];

  const matches = finished.slice(0, 5);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-gray-200 p-6 space-y-8">

      {/* HERO */}
      <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <h1 className="text-3xl font-bold">🏀 {season?.name || "Season"}</h1>
        <p className="text-white/80 mt-2">
          {mvp
            ? `🔥 MVP: ${mvp.name} (${mvp.total.toFixed(1)})`
            : "No stats yet this season"}
        </p>
      </div>

      {/* MVP */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center hover:shadow-xl transition">
        <div>
          <p className="text-sm text-gray-500">🌟 Season MVP</p>
          <h2 className="text-2xl font-bold">{mvp?.name || "No MVP yet"}</h2>
          <p className="text-indigo-600 font-bold">
            {mvp ? `${mvp.total.toFixed(1)} rating` : ""}
          </p>
        </div>

        {mvp?.img && (
          <img
            src={mvp.img}
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
          />
        )}
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* TEAMS */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-lg font-bold mb-4">🏆 Season Teams</h2>

          <div className="space-y-3">
            {teams.map((t, i) => (
              <div
                key={t.name}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-gray-500 w-6">
                    #{i + 1}
                  </div>

                  {t.logo ? (
                    <img src={t.logo} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300" />
                  )}

                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.wins} Wins • {t.losses} Losses
                    </p>
                  </div>
                </div>

                <span className="text-lg">
                  {t.wins > t.losses ? "🔥" : "⚡"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PLAYERS */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-lg font-bold mb-4">👤 Season Players</h2>

          <div className="space-y-3">
            {topPlayers.slice(0, 6).map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-gray-500 w-6">
                    #{i + 1}
                  </div>

                  {p.img ? (
                    <img src={p.img} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300" />
                  )}

                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-gray-500">Season Rating</p>
                  </div>
                </div>

                <span className="font-bold text-indigo-600">
                  {p.total.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MATCHES */}
      <div className="bg-white rounded-2xl shadow-lg p-5">
        <h2 className="text-lg font-bold mb-4">📝 Recent Matches</h2>

        <div className="space-y-4">
          {matches.map((f) => {
            const homeWon = f.homeScore > f.awayScore;
            const awayWon = f.awayScore > f.homeScore;

            return (
              <div
                key={f._id}
                className="rounded-2xl p-4 bg-gray-50 hover:bg-gray-100 transition shadow-sm hover:shadow-md"
              >
                {/* TOP ROW */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Finished</span>
                  <span className="uppercase tracking-wide">🏀 Match Result</span>
                </div>

                {/* SCOREBOARD */}
                <div className="flex items-center justify-between">

                  {/* HOME TEAM */}
                  <div className="flex items-center gap-3 w-1/3">
                    {f.homeTeamLogo ? (
                      <img
                        src={f.homeTeamLogo}
                        className={`w-10 h-10 rounded-full object-cover border ${homeWon ? "border-green-500" : "border-gray-300"
                          }`}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300" />
                    )}

                    <div>
                      <p className={`font-semibold ${homeWon ? "text-green-600" : ""}`}>
                        {f.homeTeamName}
                      </p>
                      <p className="text-xs text-gray-500">Home</p>
                    </div>
                  </div>

                  {/* SCORE */}
                  <div className="text-center w-1/3">
                    <div className="text-2xl font-bold tracking-wide">
                      {f.homeScore} - {f.awayScore}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      {homeWon ? "🏆 Home Win" : "🏆 Away Win"}
                    </div>
                  </div>

                  {/* AWAY TEAM */}
                  <div className="flex items-center justify-end gap-3 w-1/3">
                    <div className="text-right">
                      <p className={`font-semibold ${awayWon ? "text-green-600" : ""}`}>
                        {f.awayTeamName}
                      </p>
                      <p className="text-xs text-gray-500">Away</p>
                    </div>

                    {f.awayTeamLogo ? (
                      <img
                        src={f.awayTeamLogo}
                        className={`w-10 h-10 rounded-full object-cover border ${awayWon ? "border-green-500" : "border-gray-300"
                          }`}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
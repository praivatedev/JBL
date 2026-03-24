"use client"

import { useEffect, useState } from "react"
import { useMessage } from "@/hooks/showMessage/showMessage";

type Team = {
  _id: string;
  name: string;
  logoUrl: string;
};
export default function TeamsList() {
    const [teams, setTeams] = useState<Team[]>([]);
    const { error, success, showMessage } = useMessage()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function fetchTeams() {
            try {
                const res = await fetch("/api/teams")
                const data = await res.json()

                if (!res.ok)
                    return showMessage("error", data.error)

                setTeams(data)
            } catch (error) {
                showMessage("error", "Something went wrong!!")
            } finally {
                setLoading(false)
            }
        }

        fetchTeams()
    }, [])
    if (loading) return <p className="p-4">Loading teams...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6">
        <div>
      <h1 className="text-2xl font-bold mb-6">Teams</h1>

      <div className="grid gap-6 sm:grid-cols-3 md:grid-cols-3 items-center justify-center w-full">
        {teams.map((team) => (
          <div
            key={team._id}
            className="flex items-center justify-center flex-col gap-4 p-4 border rounded-lg shadow-sm bg-white h-60 w-120"
          >
            <img
              src={team.logoUrl}
              alt={team.name}
              className="w-30 h-30 object-contain rounded-full"
            />

            <h2 className="text-2xl font-semibold">{team.name}</h2>
          </div>
        ))}
      </div>
    </div>
    </div>
  
  );
}
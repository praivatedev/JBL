import { useEffect, useState } from "react";
import sendMessage from "../hooks/message";
import Message from "@/components/message/Message";

type Team = {
    _id: string,
    name: string
}
export default function PlayerForm() {
    const [form, setForm] = useState({
        teamId: "",
        firstname: "",
        lastname: "",
        age: "",
        height: "",
        weight: "",
        position: "",
        jerseyNumber: "",
        isActive: "",
        imgUrl: "",
    });
    const [error, setError] = useState("");
    const [suceess, setSuccess] = useState("")
    const [teams, setTeam] = useState<Team[]>([])
    const { message, type, showMessage } = sendMessage();

    useEffect(() => {
        async function fetchTeams() {
            const res = await fetch('/api/teams')
            const data = await res.json()
            setTeam(data);
        }

        fetchTeams()
    }, [])





    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        try {
            const res = await fetch('/api/player', {
                method: "POST",
                body: JSON.stringify(form),
            });

            const data = await res.json()

            if (!res.ok) {
                // backend returned error
                showMessage(data.error || "Failed to register player", "error");
                return;
            }
            console.log(data)
            showMessage("Player Registered sucessfully", "success")
        } catch (error) {
            showMessage("Somethimg went wrong!!", "error")
        }
    }
    return (
        <div className="flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="p-8 rounded-2xl w-full max-w-lg grid grid-cols-2 gap-4"
            >

                <div className="col-span-2">
                    <Message message={message} type={type} />
                </div>

                {/* First Name */}
                <input
                    name="firstname"
                    placeholder="First Name"
                    onChange={handleChange}
                    className="col-span-2 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Last Name */}
                <input
                    name="lastname"
                    placeholder="Last Name"
                    onChange={handleChange}
                    className="col-span-2 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Age */}
                <input
                    type="number"
                    min={0}
                    name="age"
                    placeholder="Age"
                    onChange={handleChange}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Height */}
                <input
                    type="number"
                    min={0}
                    name="height"
                    placeholder="Height (cm)"
                    onChange={handleChange}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Weight */}
                <input
                    type="number"
                    min={0}
                    name="weight"
                    placeholder="Weight (kg)"
                    onChange={handleChange}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Jersey Number */}
                <input
                    type="number"
                    min={0}
                    name="jerseyNumber"
                    placeholder="Jersey Number"
                    onChange={handleChange}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Position */}
                <select
                    name="position"
                    onChange={handleChange}
                    className="col-span-2 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select Position</option>
                    <option value="point-guard">Point Guard</option>
                    <option value="shooting-guard">Shooting Guard</option>
                    <option value="small-forward">Small Forward</option>
                    <option value="power-forward">Power Forward</option>
                    <option value="center">Center</option>
                </select>

                {/* Team */}
                <select
                    name="teamId"
                    onChange={handleChange}
                    className="col-span-2 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select Team</option>
                    {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                            {team.name}
                        </option>
                    ))}
                </select>

                {/* Button */}
                <button
                    type="submit"
                    className="col-span-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Register Player
                </button>

                {/* Error */}
                {error && (
                    <p className="col-span-2 text-red-500 text-sm text-center">
                        {error}
                    </p>
                )}
            </form>
        </div>
    )
}
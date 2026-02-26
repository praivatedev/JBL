import { useRef, useState } from "react";
import { useRouter } from "next/router";

type TeamsFormProps = {
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    file: File | null;
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
    handleSubmit: (e: React.FormEvent) => void;
    showMessage: (type: "success" | "error", text: string) => void;
    success: string;
    error: string;
}

export default function TeamsForm({
    name,
    setName,
    setFile,
    handleSubmit,
    showMessage,
    success,
    error
}: TeamsFormProps) {
    return (
        <div className="flex justify-center items-center h-screen">
            {success && (
                <p className="text-green-600 font-semibold">
                    {success}
                </p>
            )}

            {error && (
                <p className="text-red-600 font-semibold">
                    {error}
                </p>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-12 bg-gray-400 p-4 rounded-xl h-96 items-center justify-center">
                <h1 className="font-semibold text-4xl"> Team Form </h1>
                <input type="text"
                    placeholder="Enter the name of the team"
                    value={name}
                    onChange={(e) => { setName(e.target.value) }}
                    className="border border-1 border-black px-6 py-2 rounded-xl w-full"
                />

                <input
                    type="file"
                    placeholder="Enter the name of the team"
                    accept="image/*"
                    onChange={(e) => { setFile(e.target.files?.[0] || null) }}
                    className="border border-1 border-black px-6 py-2 rounded-xl"
                />

                <button
                className="bg-blue-300 px-6 py-2 rounded-xl cursor-pointer"
                > Add Team</button>


            </form>
        </div>
    )
}
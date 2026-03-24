"use client"
import PlayerForm from "./PlayerForm";


export default function createPlayer() {
    return (
        <div className="flex-col flex items-center justify-center h-screen">
           <div className="bg-gray-300 rounded-xl py-6 px-3 shadow-md">
             <h1 className="col-span-2 text-2xl font-bold text-center mb-4">
                Register as a Player
            </h1>
            <PlayerForm />
           </div>
        </div>
    )
} 
"use client"
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TeamsForm from "@/components/teams/TeamsForm";
import { useMessage } from "@/hooks/showMessage/showMessage";

export default function TeamsPage() {

    const [name, setName] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const {error, success, showMessage} = useMessage()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!file)
            return showMessage("error", "Please upload an image!!")

        const formData = new FormData()
        formData.append("file", file)

        try {
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            const uploadData = await uploadRes.json()

            if (!uploadRes.ok || !uploadData.logoUrl) {
                return showMessage("error", "Image upload failed!!")
            }

            const res = await fetch("/api/teams", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    logoUrl: uploadData.logoUrl
                })
            })

            const data = await res.json()

            if (!res.ok)
                return showMessage("error", data.error)

            showMessage("success", data.success)
        } catch (error) {
            showMessage("error", "Failed to add team!!")
        }


    }

    return (
        <TeamsForm
            name={name}
            setName={setName}
            file={file}
            setFile={setFile}
            handleSubmit={handleSubmit}
            showMessage={showMessage}
            success={success}
            error={error}
        />
    )
}
"use client";
import { useParams } from "next/navigation";
import FixtureStats from "@/components/stats/stats";

export default function FixturePage() {
  const params = useParams();

  // ✅ FIX: handle array case
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  if (!id || id.length !== 24) {
    return (
      <p className="text-red-500 text-center py-10">
        Invalid fixture ID: {String(id)}
      </p>
    );
  }

  return <FixtureStats fixtureId={id} />;
}
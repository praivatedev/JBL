"use client";

type Props = {
  message: string;
  type: "success" | "error" | "";
};

export default function Message({ message, type }: Props) {
  if (!message) return null;

  return (
    <div
      className={`p-3 text-center ${
        type === "success" ? "text-green-500 font-semibold" : "text-red-500 font-semibold"
      }`}
    >
      {message}
    </div>
  );
}
import { useRef, useState } from "react";

export function useMessage() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (type === "success") {
      setError("");
      setSuccess(text);
    } else {
      setSuccess("");
      setError(text);
    }

    timeoutRef.current = setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  return { success, error, showMessage };
}
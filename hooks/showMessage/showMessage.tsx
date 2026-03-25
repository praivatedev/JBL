import { useRef, useState } from "react";

type MessageType = "success" | "error" | ""

export function useMessage() {
  const [message, setMessage] = useState<string>("");
  const [type, setType] = useState<MessageType>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showMessage = (msg: string, msgType: MessageType, duration = 3000) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setMessage(msg)
    setType(msgType)

    timeoutRef.current = setTimeout(() => {
      setMessage("");
      setType("");
    }, duration);
  };

  return { type, message, showMessage };
}
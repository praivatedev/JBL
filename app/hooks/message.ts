import { useState } from "react"; 

type MessageType = "success" | "error" | ""

export default function sendMessage () {
    const [message, setMessage] = useState("")
    const [type, setType] = useState<MessageType>("")

    const showMessage = (msg: string, msgType: MessageType, duration = 3000 ) => {
        setMessage(msg);
        setType(msgType)

        setTimeout(()=>{
            setMessage("")
            setType("")
        }, duration)
    }
    return {
    message,
    type,
    showMessage,
  };

}
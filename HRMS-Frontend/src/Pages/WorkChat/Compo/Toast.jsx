import { useEffect, useRef, useState } from "react";
import "./Toast.css";

export default function Toast({ message, type = "success", duration = 2000, onClose }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (duration === null || duration === Infinity) return;

    // Start exit animation 300ms before the duration ends
    const exitDelay = Math.max(duration - 300, 0);

    timerRef.current = setTimeout(() => {
      setExiting(true);
      // After exit animation completes, call onClose
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    }, exitDelay);

    return () => clearTimeout(timerRef.current);
  }, [duration, message]); // re-run when message changes (new toast)

  return (
    <div className={`toast toast-${type}${exiting ? " toast-exit" : ""}`}>
      <div className="toast-icon">
        {type === "success" && "✓"}
        {type === "error"   && "✕"}
        {type === "info"    && "ℹ"}
      </div>
      <div className="toast-message">{message}</div>
    </div>
  );
}

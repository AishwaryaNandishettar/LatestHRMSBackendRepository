import { useState, useEffect, useRef } from "react";
import "./CallReactions.css";

const REACTIONS = ["👍", "❤️", "😂", "😮", "👏", "🎉", "🔥", "💯"];

/**
 * Floating reaction picker + animated reaction display
 * Usage: <CallReactions onReact={fn} reactions={[{id, emoji, name, x}]} />
 */
export function ReactionsBar({ onReact }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="reactions-bar">
      <button
        className={`cs-ctrl-btn${open ? " cs-ctrl-active" : ""}`}
        onClick={() => setOpen(o => !o)}
        title="React"
      >
        😊
        <span>React</span>
      </button>

      {open && (
        <div className="reactions-picker">
          {REACTIONS.map(emoji => (
            <button
              key={emoji}
              className="reaction-btn"
              onClick={() => { onReact(emoji); setOpen(false); }}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Floating reaction animations — renders reactions flying up from the bottom
 */
export function FloatingReactions({ reactions }) {
  return (
    <div className="floating-reactions-container" aria-hidden="true">
      {reactions.map(r => (
        <div
          key={r.id}
          className="floating-reaction"
          style={{ left: `${r.x}%` }}
        >
          <span className="floating-reaction-emoji">{r.emoji}</span>
          {r.name && <span className="floating-reaction-name">{r.name}</span>}
        </div>
      ))}
    </div>
  );
}

/**
 * Hook to manage floating reactions state
 * Returns { reactions, addReaction }
 */
export function useReactions() {
  const [reactions, setReactions] = useState([]);
  const counterRef = useRef(0);

  const addReaction = (emoji, name = "") => {
    const id = ++counterRef.current;
    const x = 10 + Math.random() * 80; // random horizontal position 10-90%
    setReactions(prev => [...prev, { id, emoji, name, x }]);

    // Remove after animation completes (3s)
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);
  };

  return { reactions, addReaction };
}

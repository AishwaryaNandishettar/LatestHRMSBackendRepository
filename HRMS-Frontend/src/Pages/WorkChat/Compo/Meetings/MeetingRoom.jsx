/**
 * MeetingRoom — LiveKit SFU, fully custom UI.
 *
 * Uses LiveKit primitives (GridLayout, ParticipantTile, useTracks) instead of
 * the black-box VideoConference component so we can:
 *   - Add our own control bar (raise hand, settings, people, chat)
 *   - Show one chat panel on the right (no duplicate chat buttons)
 *   - Fix Edge rendering (explicit pixel heights, no CSS grid ambiguity)
 */

import React, {
  useEffect, useRef, useState, useContext, useCallback,
} from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
  useTracks,
  useParticipants,
  useLocalParticipant,
  useRoomContext,
  ConnectionStateToast,
  useDataChannel,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track, RoomEvent } from "livekit-client";
import {
  FaMicrophone, FaMicrophoneSlash,
  FaVideo, FaVideoSlash,
  FaHandPaper, FaCommentAlt, FaUsers, FaCog,
  FaPhoneSlash, FaTimes, FaExpand, FaCompress,
  FaWindowMinimize, FaPaperPlane, FaDesktop,
} from "react-icons/fa";
import { AuthContext } from "../../../../Context/Authcontext";
import "./MeetingRoom.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082";

// ─── Token fetcher ────────────────────────────────────────────────────────────
async function fetchLiveKitToken(meetingId, displayName, token) {
  const params = new URLSearchParams({ meetingId, displayName });
  const res = await fetch(`${API_BASE}/api/livekit/token?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  return res.json();
}

// ─── Video grid (uses LiveKit hooks, must be inside <LiveKitRoom>) ────────────
function VideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera,      withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "100%", width: "100%" }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}

// ─── Custom control bar ───────────────────────────────────────────────────────
function MeetingControls({
  onLeave, onToggleChat, onTogglePeople, onToggleSettings,
  chatOpen, peopleOpen, settingsOpen, unread,
  handRaised, onToggleHand,
}) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  const micEnabled = localParticipant?.isMicrophoneEnabled ?? true;
  const camEnabled = localParticipant?.isCameraEnabled ?? true;
  const [screenSharing, setScreenSharing] = useState(false);

  const toggleMic = () => localParticipant?.setMicrophoneEnabled(!micEnabled);
  const toggleCam = () => localParticipant?.setCameraEnabled(!camEnabled);

  const toggleScreen = async () => {
    try {
      if (!screenSharing) {
        await localParticipant?.setScreenShareEnabled(true);
        setScreenSharing(true);
      } else {
        await localParticipant?.setScreenShareEnabled(false);
        setScreenSharing(false);
      }
    } catch (e) {
      console.warn("Screen share:", e.message);
    }
  };

  // Listen for screen share ending via browser stop button
  useEffect(() => {
    if (!room) return;
    const handler = () => setScreenSharing(false);
    room.on(RoomEvent.LocalTrackUnpublished, handler);
    return () => room.off(RoomEvent.LocalTrackUnpublished, handler);
  }, [room]);

  return (
    <div className="meeting-controls">
      {/* Mic */}
      <button
        className={`control-btn ${micEnabled ? "active" : "inactive"}`}
        onClick={toggleMic}
        title={micEnabled ? "Mute" : "Unmute"}
      >
        <span className="ctrl-icon">
          {micEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </span>
        <span className="ctrl-label">{micEnabled ? "Mute" : "Unmute"}</span>
      </button>

      {/* Camera */}
      <button
        className={`control-btn ${camEnabled ? "active" : "inactive"}`}
        onClick={toggleCam}
        title={camEnabled ? "Stop video" : "Start video"}
      >
        <span className="ctrl-icon">
          {camEnabled ? <FaVideo /> : <FaVideoSlash />}
        </span>
        <span className="ctrl-label">{camEnabled ? "Stop video" : "Start video"}</span>
      </button>

      {/* Screen share */}
      <button
        className={`control-btn ${screenSharing ? "active" : ""}`}
        onClick={toggleScreen}
        title={screenSharing ? "Stop sharing" : "Share screen"}
      >
        <span className="ctrl-icon"><FaDesktop /></span>
        <span className="ctrl-label">{screenSharing ? "Stop share" : "Share"}</span>
      </button>

      {/* Raise hand */}
      <button
        className={`control-btn ${handRaised ? "active" : ""}`}
        onClick={onToggleHand}
        title={handRaised ? "Lower hand" : "Raise hand"}
      >
        <span className="ctrl-icon"><FaHandPaper /></span>
        <span className="ctrl-label">{handRaised ? "Lower hand" : "Raise hand"}</span>
      </button>

      {/* Chat */}
      <button
        className={`control-btn ${chatOpen ? "active" : ""}`}
        onClick={onToggleChat}
        title="Chat"
      >
        <span className="ctrl-icon"><FaCommentAlt /></span>
        {unread > 0 && <span className="unread-badge">{unread}</span>}
        <span className="ctrl-label">Chat</span>
      </button>

      {/* People */}
      <button
        className={`control-btn ${peopleOpen ? "active" : ""}`}
        onClick={onTogglePeople}
        title="People"
      >
        <span className="ctrl-icon"><FaUsers /></span>
        <span className="ctrl-label">People</span>
      </button>

      {/* Settings */}
      <button
        className={`control-btn ${settingsOpen ? "active" : ""}`}
        onClick={onToggleSettings}
        title="Settings"
      >
        <span className="ctrl-icon"><FaCog /></span>
        <span className="ctrl-label">Settings</span>
      </button>

      {/* Leave */}
      <button className="control-btn leave-btn" onClick={onLeave} title="Leave">
        <span className="ctrl-icon"><FaPhoneSlash /></span>
        <span className="ctrl-label">Leave</span>
      </button>
    </div>
  );
}

// ─── People panel ─────────────────────────────────────────────────────────────
function PeoplePanel({ onClose, handRaisedBy = new Map() }) {
  const participants = useParticipants();
  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
          People ({participants.length})
        </h3>
        <button className="btn-close-chat" onClick={onClose}><FaTimes /></button>
      </div>
      <div className="chat-messages">
        {participants.map(p => {
          const raised = handRaisedBy.get((p.identity || "").toLowerCase());
          return (
            <div key={p.identity} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", background: "rgba(255,255,255,0.05)",
              borderRadius: 8, marginBottom: 6,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "#6264a7", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0,
              }}>
                {(p.name || p.identity || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name || p.identity}
                  {p.isLocal && <span style={{ fontSize: 10, color: "#8a8886", marginLeft: 6 }}>(You)</span>}
                  {raised && <span style={{ marginLeft: 6 }} title="Hand raised">✋</span>}
                </div>
                <div style={{ fontSize: 11, color: "#8a8886" }}>
                  {p.isMicrophoneEnabled ? "🎙 Mic on" : "🔇 Muted"}
                  {" · "}
                  {p.isCameraEnabled ? "📹 Camera on" : "📷 Camera off"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Settings panel ───────────────────────────────────────────────────────────
function SettingsPanel({ onClose }) {
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selAudio, setSelAudio] = useState("");
  const [selVideo, setSelVideo] = useState("");
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devs => {
      setAudioDevices(devs.filter(d => d.kind === "audioinput"));
      setVideoDevices(devs.filter(d => d.kind === "videoinput"));
      const ai = devs.find(d => d.kind === "audioinput");
      const vi = devs.find(d => d.kind === "videoinput");
      if (ai) setSelAudio(ai.deviceId);
      if (vi) setSelVideo(vi.deviceId);
    }).catch(() => {});
  }, []);

  const switchAudio = async (deviceId) => {
    setSelAudio(deviceId);
    try {
      await localParticipant?.setMicrophoneEnabled(true, { deviceId: { exact: deviceId } });
    } catch {}
  };

  const switchVideo = async (deviceId) => {
    setSelVideo(deviceId);
    try {
      await localParticipant?.setCameraEnabled(true, { deviceId: { exact: deviceId } });
    } catch {}
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Settings</h3>
        <button className="btn-close-chat" onClick={onClose}><FaTimes /></button>
      </div>
      <div className="chat-messages">
        <div className="setting-group">
          <label className="mr-prejoin-device-label">Microphone</label>
          <select className="device-select" value={selAudio}
            onChange={e => switchAudio(e.target.value)}>
            {audioDevices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Microphone ${d.deviceId.slice(0, 6)}`}
              </option>
            ))}
          </select>
        </div>
        <div className="setting-group">
          <label className="mr-prejoin-device-label">Camera</label>
          <select className="device-select" value={selVideo}
            onChange={e => switchVideo(e.target.value)}>
            {videoDevices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Inner room (must be inside <LiveKitRoom>) ────────────────────────────────
function MeetingRoomContent({ meeting, stompClient, onClose, myEmail, myName }) {
  const [panel, setPanel]           = useState(null); // "chat" | "people" | "settings" | null
  const [chatMsgs, setChatMsgs]     = useState([]);
  const [chatInput, setChatInput]   = useState("");
  const [unread, setUnread]         = useState(0);
  const [handRaised, setHandRaised] = useState(false);
  const [handRaisedBy, setHandRaisedBy] = useState(new Map()); // email -> bool for remote participants
  const [isMaximized, setIsMaximized] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pos, setPos]               = useState({ x: 40, y: 40 });
  const [dragging, setDragging]     = useState(false);
  const dragOffset                  = useRef({ x: 0, y: 0 });
  const windowRef                   = useRef(null);
  const chatEndRef                  = useRef(null);
  const stompRef                    = useRef(stompClient);
  const panelRef                    = useRef(panel);

  useEffect(() => { stompRef.current = stompClient; }, [stompClient]);
  useEffect(() => { panelRef.current = panel; }, [panel]);

  // ── LiveKit DataChannel — reliable chat transport ─────────────────────────
  // All participants in the LiveKit room receive messages on this channel.
  // This replaces the STOMP /topic/meeting/{id}/chat subscription which was
  // unreliable due to subscription timing and reconnect issues.
  const { send: sendDataMsg } = useDataChannel("meeting-chat", (msg) => {
    try {
      const text = new TextDecoder().decode(msg.payload);
      const cm   = JSON.parse(text);
      console.log("[MeetingRoom] LiveKit chat received:", cm);
      setChatMsgs(p => [...p, cm]);
      // Only increment unread when the chat panel is closed
      if (panelRef.current !== "chat") setUnread(u => u + 1);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    } catch (e) {
      console.warn("[MeetingRoom] Failed to parse chat message:", e);
    }
  });

  // ── STOMP: join/leave tracking + raise-hand events ────────────────────────
  // Chat is now handled by LiveKit DataChannel above; STOMP is only used for
  // presence (join/leave) and raise-hand broadcasts.
  useEffect(() => {
    if (!meeting?.id || !stompClient) return;

    let subscriptions = [];
    let joined = false;

    const setup = () => {
      const sc = stompRef.current;
      if (!sc?.connected) return false;

      console.log(`[MeetingRoom] Setting up STOMP for meeting ${meeting.id}`);

      subscriptions.push(sc.subscribe("/user/queue/meeting-events", () => {}));
      subscriptions.push(sc.subscribe(`/topic/meeting/${meeting.id}`, (msg) => {
        try {
          const ev = JSON.parse(msg.body);
          if (ev.eventType === "HAND_RAISE_CHANGED") {
            const from = ev.participantEmail?.toLowerCase();
            if (from && from !== myEmail) {
              setHandRaisedBy(prev => {
                const next = new Map(prev);
                if (ev.handRaised) next.set(from, true);
                else next.delete(from);
                return next;
              });
            }
          }
        } catch {}
      }));

      sc.publish({
        destination: "/app/meeting.join",
        body: JSON.stringify({ meetingId: meeting.id, userEmail: myEmail, displayName: myName }),
      });
      joined = true;
      console.log(`[MeetingRoom] Joined meeting ${meeting.id} as ${myEmail}`);
      return true;
    };

    // Try immediately, then retry every 500 ms until STOMP is connected
    if (!setup()) {
      const interval = setInterval(() => {
        if (setup()) clearInterval(interval);
      }, 500);
      return () => {
        clearInterval(interval);
        subscriptions.forEach(s => { try { s.unsubscribe(); } catch {} });
        if (joined) {
          const sc = stompRef.current;
          if (sc?.connected) {
            sc.publish({
              destination: "/app/meeting.leave",
              body: JSON.stringify({ meetingId: meeting.id, userEmail: myEmail }),
            });
          }
        }
      };
    }

    return () => {
      subscriptions.forEach(s => { try { s.unsubscribe(); } catch {} });
      const sc = stompRef.current;
      if (sc?.connected) {
        sc.publish({
          destination: "/app/meeting.leave",
          body: JSON.stringify({ meetingId: meeting.id, userEmail: myEmail }),
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting?.id, stompClient]);

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    if (isMaximized) return;
    if (!e.target.closest(".mr-drag-handle")) return;
    e.preventDefault();
    setDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [isMaximized, pos]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const nx = e.clientX - dragOffset.current.x;
      const ny = e.clientY - dragOffset.current.y;
      const w = windowRef.current?.offsetWidth  || (isMinimized ? 280 : 960);
      const h = windowRef.current?.offsetHeight || (isMinimized ? 60  : 640);
      const maxX = window.innerWidth  - w;
      const maxY = window.innerHeight - h;
      setPos({ x: Math.max(0, Math.min(nx, maxX)), y: Math.max(0, Math.min(ny, maxY)) });
    };
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [dragging, isMinimized]);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const msg = {
      meetingId:   meeting.id,
      senderEmail: myEmail,
      senderName:  myName,
      message:     chatInput.trim(),
      timestamp:   new Date().toISOString(),
    };

    // Add to own chat immediately (sender doesn't receive their own DataChannel message)
    setChatMsgs(p => [...p, msg]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);

    // Broadcast via LiveKit DataChannel — all other participants receive it instantly
    try {
      const encoded = new TextEncoder().encode(JSON.stringify(msg));
      sendDataMsg(encoded, { reliable: true });
      console.log("[MeetingRoom] Chat sent via LiveKit DataChannel:", msg.message);
    } catch (e) {
      console.error("[MeetingRoom] Failed to send chat via DataChannel:", e);
    }

    setChatInput("");
  };

  const togglePanel = (name) => {
    setPanel(p => p === name ? null : name);
    if (name === "chat") setUnread(0);
  };

  const toggleHand = () => {
    const next = !handRaised;
    setHandRaised(next);
    const sc = stompRef.current;
    if (sc?.connected) {
      sc.publish({
        destination: "/app/meeting.raiseHand",
        body: JSON.stringify({ meetingId: meeting.id, userEmail: myEmail, handRaised: next }),
      });
      console.log("[MeetingRoom] Raise hand:", next);
    } else {
      console.warn("[MeetingRoom] STOMP not connected, raise hand not sent");
    }
  };

  // ── Window style ──────────────────────────────────────────────────────────
  const windowStyle = isMaximized
    ? { position: "fixed", inset: 0, width: "100vw", height: "100vh", borderRadius: 0 }
    : isMinimized
      ? { position: "fixed", left: pos.x, top: pos.y, width: 280, height: "auto", borderRadius: 12 }
      : { position: "fixed", left: pos.x, top: pos.y, width: 960, height: 640, borderRadius: 12 };

  // ── Minimized ─────────────────────────────────────────────────────────────
  if (isMinimized) {
    return (
      <div
        ref={windowRef}
        className="meeting-room"
        style={{
          ...windowStyle,
          background: "#1f1f1f",
          boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
          zIndex: 9000,
          cursor: dragging ? "grabbing" : "default",
        }}
        onMouseDown={onMouseDown}
      >
        <div className="minimized-content mr-drag-handle" style={{ cursor: "grab" }}>
          <span style={{ fontWeight: 600, color: "#fff", fontSize: 13 }}>{meeting.title}</span>
          <div className="minimized-controls">
            <button className="control-btn-mini" onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}><FaExpand /></button>
            <button className="control-btn-mini leave-btn" onClick={(e) => { e.stopPropagation(); onClose(); }}><FaPhoneSlash /></button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div
      ref={windowRef}
      className="meeting-room"
      style={{
        ...windowStyle,
        display: "flex",
        flexDirection: "column",
        background: "#1f1f1f",
        color: "#fff",
        fontFamily: "'Segoe UI', sans-serif",
        zIndex: 9000,
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
      }}
      onMouseDown={onMouseDown}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="meeting-room-header mr-drag-handle"
        style={{ cursor: isMaximized ? "default" : "grab" }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, flex: 1 }}>
          {meeting.title}
        </h2>
        <ConnectionStateToast />
        <div className="header-actions">
          <button className="btn-icon" onClick={() => {
              // Start minimized bar at bottom-right so it's out of the way
              setPos({ x: window.innerWidth - 300, y: window.innerHeight - 80 });
              setIsMinimized(true);
            }} title="Minimize">
            <FaWindowMinimize />
          </button>
          <button className="btn-icon" onClick={() => setIsMaximized(m => !m)}
            title={isMaximized ? "Restore" : "Maximize"}>
            {isMaximized ? <FaCompress /> : <FaExpand />}
          </button>
          <button className="btn-close" onClick={onClose} title="Leave"><FaTimes /></button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0, position: "relative" }}>

        {/* Video grid — explicit height so Edge renders tiles */}
        <div style={{
          flex: 1, position: "relative", overflow: "hidden",
          height: "100%", minHeight: 0,
          /* Edge fix: force block formatting context */
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <VideoGrid />
          </div>
        </div>

        {/* ── Right panel: chat / people / settings ──────────────────────── */}
        {panel === "chat" && (
          <div className="chat-panel">
            <div className="chat-header">
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Chat</h3>
              <button className="btn-close-chat" onClick={() => setPanel(null)}><FaTimes /></button>
            </div>
            <div className="chat-messages">
              {chatMsgs.length === 0
                ? <div className="chat-empty">No messages yet.</div>
                : chatMsgs.map((m, i) => (
                  <div key={i} className={`chat-message ${m.senderEmail === myEmail ? "own-message" : ""}`}>
                    <div className="message-sender">{m.senderName || m.senderEmail}</div>
                    <div className="message-content">{m.message}</div>
                    <div className="message-time">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))
              }
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input-container">
              <input
                className="chat-input"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="Type a message..."
              />
              <button className="btn-send-chat" onClick={sendChat}><FaPaperPlane /></button>
            </div>
          </div>
        )}

        {panel === "people" && <PeoplePanel onClose={() => setPanel(null)} handRaisedBy={handRaisedBy} />}
        {panel === "settings" && <SettingsPanel onClose={() => setPanel(null)} />}
      </div>

      {/* ── Raise hand notification banner ─────────────────────────────────── */}
      {handRaisedBy.size > 0 && (
        <div style={{
          position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)",
          background: "rgba(98,100,167,0.95)", color: "#fff", borderRadius: 8,
          padding: "8px 16px", fontSize: 13, fontWeight: 600, zIndex: 10,
          display: "flex", alignItems: "center", gap: 8, pointerEvents: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}>
          ✋ {Array.from(handRaisedBy.keys()).map(e => e.split("@")[0]).join(", ")} raised hand
        </div>
      )}

      {/* ── Control bar ────────────────────────────────────────────────────── */}
      <MeetingControls
        onLeave={onClose}
        onToggleChat={() => togglePanel("chat")}
        onTogglePeople={() => togglePanel("people")}
        onToggleSettings={() => togglePanel("settings")}
        chatOpen={panel === "chat"}
        peopleOpen={panel === "people"}
        settingsOpen={panel === "settings"}
        unread={unread}
        handRaised={handRaised}
        onToggleHand={toggleHand}
      />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function MeetingRoom({ meeting, stompClient, onClose }) {
  const { user, token: authToken } = useContext(AuthContext);
  const myEmail = (user?.email || "").trim().toLowerCase();
  const myName  = user?.name || myEmail.split("@")[0] || "Me";

  const [livekitToken, setLivekitToken] = useState(null);
  const [livekitUrl, setLivekitUrl]     = useState(null);
  const [tokenError, setTokenError]     = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (!meeting?.id || !authToken) return;
    fetchLiveKitToken(meeting.id, myName, authToken)
      .then(({ token, url }) => { setLivekitToken(token); setLivekitUrl(url); setLoading(false); })
      .catch(err => { setTokenError(err.message); setLoading(false); });
  }, [meeting?.id, authToken, myName]);

  if (loading) return (
    <div style={{ position: "fixed", inset: 0, background: "#111", display: "flex",
      alignItems: "center", justifyContent: "center", color: "#fff", zIndex: 9000,
      flexDirection: "column", gap: 16 }}>
      <div className="jmp-spinner" />
      <p>Connecting to meeting server…</p>
    </div>
  );

  if (tokenError) return (
    <div style={{ position: "fixed", inset: 0, background: "#111", display: "flex",
      alignItems: "center", justifyContent: "center", color: "#fff", zIndex: 9000,
      flexDirection: "column", gap: 16 }}>
      <p>⚠️ Could not connect: {tokenError}</p>
      <button onClick={onClose} style={{ padding: "8px 20px", background: "#e74c3c",
        border: "none", borderRadius: 6, color: "#fff", cursor: "pointer" }}>Close</button>
    </div>
  );

  return (
    <LiveKitRoom
      token={livekitToken}
      serverUrl={livekitUrl}
      connect={true}
      video={true}
      audio={true}
      onDisconnected={onClose}
      // No style here — MeetingRoomContent owns the window positioning
    >
      <RoomAudioRenderer />
      <MeetingRoomContent
        meeting={meeting}
        stompClient={stompClient}
        onClose={onClose}
        myEmail={myEmail}
        myName={myName}
      />
    </LiveKitRoom>
  );
}

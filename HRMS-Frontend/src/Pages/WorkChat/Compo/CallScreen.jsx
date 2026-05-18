import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  FaPhoneSlash, FaUserPlus, FaMicrophone, FaMicrophoneSlash,
  FaVideo, FaVideoSlash, FaDesktop, FaExpand, FaCompress,
  FaCommentAlt, FaCog, FaUsers, FaPhone, FaTimes,
  FaHandPaper, FaSignOutAlt, FaCircle, FaStopCircle,
  FaMagic, FaVolumeUp, FaVolumeMute, FaWindowMinimize
} from "react-icons/fa";
import { MdScreenShare, MdStopScreenShare } from "react-icons/md";

import webrtcPeer from "../../../Services/webrtcPeer";
import activeSpeakerService from "../../../Services/activeSpeaker";
import AddParticipantModal from "./AddParticipantModal";
import Toast from "./Toast";
import CallLobby from "./CallLobby";
import CallQuality from "./CallQuality";
import { ReactionsBar, FloatingReactions, useReactions } from "./CallReactions";
import { sendCallChatMessage, sendReactionSignal, sendWaitingRoomAdmit, sendWaitingRoomDeny,
         sendRecordingStarted, sendRecordingStopped } from "../../../api/socket";
import { useCall } from "../../../Context/CallContext";
import "./CallScreen.css";
import "./CallReactions.css";
import "./CallQuality.css";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: CtrlBtn
// A reusable control-bar button with active/danger styling
// ─────────────────────────────────────────────────────────────────────────────
function CtrlBtn({ active, danger, onClick, title, children, badge }) {
  return (
    <button
      className={`cs-ctrl-btn${active ? " cs-ctrl-btn--active" : ""}${danger ? " cs-ctrl-btn--danger" : ""}`}
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active !== undefined ? !!active : undefined}
    >
      {children}
      {badge > 0 && <span className="cs-ctrl-badge">{badge}</span>}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: TileView
// Renders a single participant tile (video or avatar)
// ─────────────────────────────────────────────────────────────────────────────
function TileView({ tile, localVidRef, isActiveSpeaker, initials, backgroundBlur }) {
  const isSelf = tile.isSelf;
  const hasVideo = tile.videoEnabled !== false && (isSelf ? true : !!tile.stream);

  return (
    <div
      className={`cs-tile${isActiveSpeaker ? " cs-tile--speaking" : ""}${isSelf ? " cs-tile--self" : ""}`}
      aria-label={tile.name || tile.email}
    >
      {/* Video element */}
      {isSelf ? (
        <video
          ref={localVidRef}
          autoPlay
          muted
          playsInline
          className="cs-tile-video"
          style={backgroundBlur ? { filter: "blur(8px)" } : undefined}
        />
      ) : (
        hasVideo && tile.stream ? (
          <RemoteVideo stream={tile.stream} />
        ) : null
      )}

      {/* Avatar fallback when no video */}
      {!hasVideo && (
        <div className="cs-tile-avatar">
          <span className="cs-tile-initials">{initials(tile.name || tile.email)}</span>
        </div>
      )}

      {/* Name label */}
      <div className="cs-tile-label">
        <span className="cs-tile-name">{tile.name || tile.email}</span>
        {tile.handRaised && <FaHandPaper className="cs-tile-hand" title="Hand raised" />}
        {tile.audioEnabled === false && <FaMicrophoneSlash className="cs-tile-muted" title="Muted" />}
        {isActiveSpeaker && <span className="cs-tile-speaking-dot" />}
      </div>
    </div>
  );
}

// Helper: attach a remote MediaStream to a <video> element via ref
function RemoteVideo({ stream }) {
  const vidRef = useRef(null);
  useEffect(() => {
    if (vidRef.current && stream) {
      vidRef.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <video
      ref={vidRef}
      autoPlay
      playsInline
      className="cs-tile-video"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: ChatPanel
// ─────────────────────────────────────────────────────────────────────────────
function ChatPanel({ msgs, input, setInput, onSend, chatEndRef, onClose }) {
  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="cs-panel cs-panel--chat" role="region" aria-label="In-call chat">
      <div className="cs-panel-header">
        <span>Chat</span>
        <button className="cs-panel-close" onClick={onClose} aria-label="Close chat"><FaTimes /></button>
      </div>
      <div className="cs-chat-messages">
        {msgs.length === 0 && (
          <p className="cs-chat-empty">No messages yet. Say hello!</p>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`cs-chat-msg${m.isSelf ? " cs-chat-msg--self" : ""}`}>
            <span className="cs-chat-sender">{m.sender}</span>
            <span className="cs-chat-text">{m.text}</span>
            <span className="cs-chat-time">{m.time}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="cs-chat-input-row">
        <textarea
          className="cs-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message…"
          rows={2}
          aria-label="Chat message input"
        />
        <button className="cs-chat-send" onClick={onSend} aria-label="Send message">
          <FaPhone style={{ transform: "rotate(135deg)" }} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: PeoplePanel
// ─────────────────────────────────────────────────────────────────────────────
function PeoplePanel({ participants, myInitials, micOn, camOn, handRaised, initials, onMute, onRemove, onClose }) {
  return (
    <div className="cs-panel cs-panel--people" role="region" aria-label="Participants">
      <div className="cs-panel-header">
        <span>People ({participants.length + 1})</span>
        <button className="cs-panel-close" onClick={onClose} aria-label="Close people panel"><FaTimes /></button>
      </div>
      <ul className="cs-people-list">
        {/* Self entry */}
        <li className="cs-people-item cs-people-item--self">
          <div className="cs-people-avatar">{myInitials}</div>
          <div className="cs-people-info">
            <span className="cs-people-name">You</span>
            <span className="cs-people-status">
              {!micOn && <FaMicrophoneSlash title="Muted" />}
              {!camOn && <FaVideoSlash title="Camera off" />}
              {handRaised && <FaHandPaper title="Hand raised" />}
            </span>
          </div>
        </li>
        {/* Remote participants */}
        {participants.map((p) => (
          <li key={p.email} className="cs-people-item">
            <div className="cs-people-avatar">{initials(p.name || p.email)}</div>
            <div className="cs-people-info">
              <span className="cs-people-name">{p.name || p.email}</span>
              <span className="cs-people-status">
                {p.audioEnabled === false && <FaMicrophoneSlash title="Muted" />}
                {p.videoEnabled === false && <FaVideoSlash title="Camera off" />}
                {p.handRaised && <FaHandPaper title="Hand raised" />}
                <span className={`cs-conn-dot cs-conn-dot--${p.connectionState || "connecting"}`} title={p.connectionState} />
              </span>
            </div>
            <div className="cs-people-actions">
              <button
                className="cs-people-action"
                onClick={() => onMute(p.email)}
                title="Mute participant"
                aria-label={`Mute ${p.name || p.email}`}
              >
                <FaVolumeMute />
              </button>
              <button
                className="cs-people-action cs-people-action--remove"
                onClick={() => onRemove(p.email)}
                title="Remove from call"
                aria-label={`Remove ${p.name || p.email}`}
              >
                <FaTimes />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: SettingsPanel
// ─────────────────────────────────────────────────────────────────────────────
function SettingsPanel({
  audioDevices, videoDevices, outputDevices,
  selAudio, selVideo, selOutput,
  setSelAudio, setSelVideo, setSelOutput,
  micOn, camOn, noiseSuppression, backgroundBlur,
  onToggleNoise, onToggleBlur, onClose,
  onAudioChange, onVideoChange, onOutputChange
}) {
  return (
    <div className="cs-panel cs-panel--settings" role="region" aria-label="Call settings">
      <div className="cs-panel-header">
        <span>Settings</span>
        <button className="cs-panel-close" onClick={onClose} aria-label="Close settings"><FaTimes /></button>
      </div>
      <div className="cs-settings-body">

        {/* Microphone */}
        <div className="cs-settings-group">
          <label className="cs-settings-label" htmlFor="sel-audio">Microphone</label>
          <select
            id="sel-audio"
            className="cs-settings-select"
            value={selAudio}
            onChange={(e) => { setSelAudio(e.target.value); onAudioChange(e.target.value); }}
            aria-label="Select microphone"
          >
            {audioDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0, 6)}`}</option>
            ))}
          </select>
        </div>

        {/* Camera */}
        <div className="cs-settings-group">
          <label className="cs-settings-label" htmlFor="sel-video">Camera</label>
          <select
            id="sel-video"
            className="cs-settings-select"
            value={selVideo}
            onChange={(e) => { setSelVideo(e.target.value); onVideoChange(e.target.value); }}
            aria-label="Select camera"
          >
            {videoDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 6)}`}</option>
            ))}
          </select>
        </div>

        {/* Speaker / Output */}
        <div className="cs-settings-group">
          <label className="cs-settings-label" htmlFor="sel-output">Speaker</label>
          <select
            id="sel-output"
            className="cs-settings-select"
            value={selOutput}
            onChange={(e) => { setSelOutput(e.target.value); onOutputChange(e.target.value); }}
            aria-label="Select speaker"
          >
            {outputDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Speaker ${d.deviceId.slice(0, 6)}`}</option>
            ))}
          </select>
        </div>

        {/* Noise Suppression Toggle */}
        <div className="cs-settings-group cs-settings-toggle-row">
          <span className="cs-settings-label">Noise Suppression</span>
          <button
            className={`cs-toggle-btn${noiseSuppression ? " cs-toggle-btn--on" : ""}`}
            onClick={onToggleNoise}
            aria-pressed={noiseSuppression}
            aria-label="Toggle noise suppression"
          >
            {noiseSuppression ? <FaVolumeUp /> : <FaVolumeMute />}
            <span>{noiseSuppression ? "ON" : "OFF"}</span>
          </button>
        </div>

        {/* Background Blur Toggle */}
        <div className="cs-settings-group cs-settings-toggle-row">
          <span className="cs-settings-label">Background Blur</span>
          <button
            className={`cs-toggle-btn${backgroundBlur ? " cs-toggle-btn--on" : ""}`}
            onClick={onToggleBlur}
            aria-pressed={backgroundBlur}
            aria-label="Toggle background blur"
          >
            <FaMagic />
            <span>{backgroundBlur ? "ON" : "OFF"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: WaitingRoomPanel
// ─────────────────────────────────────────────────────────────────────────────
function WaitingRoomPanel({ waitingRoom, onAdmit, onDeny, onClose }) {
  return (
    <div className="cs-panel cs-panel--waiting" role="region" aria-label="Waiting room">
      <div className="cs-panel-header">
        <span>Waiting Room ({waitingRoom.length})</span>
        <button className="cs-panel-close" onClick={onClose} aria-label="Close waiting room panel"><FaTimes /></button>
      </div>
      {waitingRoom.length === 0 ? (
        <p className="cs-waiting-empty">No one is waiting to join.</p>
      ) : (
        <ul className="cs-waiting-list">
          {waitingRoom.map((p) => (
            <li key={p.email} className="cs-waiting-item">
              <div className="cs-waiting-info">
                <span className="cs-waiting-name">{p.name || p.email}</span>
                <span className="cs-waiting-email">{p.email}</span>
              </div>
              <div className="cs-waiting-actions">
                <button
                  className="cs-waiting-admit"
                  onClick={() => onAdmit(p.email)}
                  aria-label={`Admit ${p.name || p.email}`}
                >
                  Admit
                </button>
                <button
                  className="cs-waiting-deny"
                  onClick={() => onDeny(p.email)}
                  aria-label={`Deny ${p.name || p.email}`}
                >
                  Deny
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component: CallScreen
// Teams-style floating call window with Phase 2 features:
//   lobby, reactions, quality indicator, noise suppression, background blur,
//   waiting room, recording, active speaker detection, device switching
// ─────────────────────────────────────────────────────────────────────────────
export default function CallScreen({
  user,
  type,
  onEnd,
  onAccept,
  onReject,
  isInitiator,
  callId,
  waitingForAccept,
  callState,
  currentUserEmail,
}) {
  const isIncomingRinging =
    !!onAccept && !!onReject && !isInitiator && callState === "ringing";

  // ── Context ────────────────────────────────────────────────────────────────
  const {
    participants: ctxParticipants,
    activeSpeaker: ctxActiveSpeaker,
    // Use identity from CallContext (sourced from AuthContext) — always correct
    myEmail: ctxMyEmail,
    myName: ctxMyName,
    setupWebRTCCallbacks,
    getPendingOffers,
    broadcastMediaState,
    broadcastRaiseHand,
    broadcastReaction,
    addParticipantToCall,
    muteParticipant,
    removeParticipantFromCall,
    waitingRoom,
    isRecording,
    admitFromWaitingRoom,
    denyFromWaitingRoom,
  } = useCall();

  // ── Core state ─────────────────────────────────────────────────────────────
  const [seconds, setSeconds]             = useState(0);
  const [connected, setConnected]         = useState(false);
  const [micOn, setMicOn]                 = useState(true);
  const [camOn, setCamOn]                 = useState(type === "video");
  const [screenSharing, setScreenSharing] = useState(false);
  const [fullscreen, setFullscreen]       = useState(false);
  const [handRaised, setHandRaised]       = useState(false);
  const [toast, setToast]                 = useState(null);
  const [participants, setParticipants]   = useState([]);
  const [activeSpeaker, setActiveSpeaker] = useState(null);

  // ── Phase 2 state ──────────────────────────────────────────────────────────
  const [lobbyDone, setLobbyDone]             = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [backgroundBlur, setBackgroundBlur]   = useState(false);
  const [recordingActive, setRecordingActive] = useState(false);

  // ── Panel ──────────────────────────────────────────────────────────────────
  const [panel, setPanel] = useState(null); // "chat"|"people"|"settings"|"waitingRoom"|"add"

  // ── Chat ───────────────────────────────────────────────────────────────────
  const [chatMsgs, setChatMsgs]   = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [unread, setUnread]       = useState(0);

  // ── Devices ────────────────────────────────────────────────────────────────
  const [audioDevices, setAudioDevices]   = useState([]);
  const [videoDevices, setVideoDevices]   = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [selAudio, setSelAudio]           = useState("");
  const [selVideo, setSelVideo]           = useState("");
  const [selOutput, setSelOutput]         = useState("");

  // ── Drag ───────────────────────────────────────────────────────────────────
  const [pos, setPos]           = useState(() => ({
    x: Math.max(0, Math.round((window.innerWidth  - 900) / 2)),
    y: Math.max(0, Math.round((window.innerHeight - 600) / 2)),
  }));
  const [dragging, setDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragOff                 = useRef({ x: 0, y: 0 });

  // ── Reactions ──────────────────────────────────────────────────────────────
  const { reactions, addReaction } = useReactions();

  // ── Refs ───────────────────────────────────────────────────────────────────
  const ringRef       = useRef(null);
  const localVidRef   = useRef(null);
  const remoteVidRef  = useRef(null);
  const remoteAudRef  = useRef(null);
  const callBoxRef    = useRef(null);
  const chatEndRef    = useRef(null);
  const initRef       = useRef(false);
  const remoteVidsRef = useRef({});

  // ── Helpers ────────────────────────────────────────────────────────────────
  // NOTE: `user` prop = the OTHER person (remote user). Never use user.name for self.
  // Use identity from CallContext which is sourced from AuthContext — always correct.
  const myEmail = ctxMyEmail || (currentUserEmail || "").trim().toLowerCase();
  const myName  = ctxMyName  || myEmail.split("@")[0] || "You";
  const initials    = (s) => (s || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const myInitials  = initials(myName);
  const isConnected = callState === "connected" || connected;
  const isMultiParty = participants.length > 0;

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isConnected]);

  const fmt = () =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const statusText = () => {
    if (isIncomingRinging) return `Incoming ${type === "video" ? "video" : "voice"} call`;
    if (waitingForAccept)  return "Calling…";
    if (isConnected)       return fmt();
    const s = callState;
    if (s === "calling")    return "Calling…";
    if (s === "ringing")    return "Ringing…";
    if (s === "connecting") return "Connecting…";
    return type === "video" ? "Starting video…" : "Starting call…";
  };

  // ── Sync participants from context ─────────────────────────────────────────
  useEffect(() => {
    setParticipants(Array.from(ctxParticipants.values()));
  }, [ctxParticipants]);

  // ── Sync active speaker from context ──────────────────────────────────────
  useEffect(() => {
    setActiveSpeaker(ctxActiveSpeaker);
  }, [ctxActiveSpeaker]);

  // ── Ring ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const shouldRing = !isConnected && callState !== "connecting";
    if (ringRef.current) {
      shouldRing ? ringRef.current.play().catch(() => {}) : ringRef.current.pause();
    }
    return () => ringRef.current?.pause();
  }, [isConnected, callState]);

  // ── WebRTC init (only after lobby) ─────────────────────────────────────────
  useEffect(() => {
    if (!lobbyDone || initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        await webrtcPeer.initialize(isInitiator, callId);
        setupWebRTCCallbacks(callId);

        // Apply noise suppression constraint
        const stream = await webrtcPeer.startLocalMedia(type);
        if (localVidRef.current) localVidRef.current.srcObject = stream;

        // Add local stream to active speaker detection
        if (stream && myEmail) {
          activeSpeakerService.addStream(myEmail, stream);
        }

        // Flush pending offers
        const pending = getPendingOffers();
        for (const [email, sdp] of pending.entries()) {
          await webrtcPeer.handleOffer(email, sdp);
        }

        if (isInitiator && !waitingForAccept && user?.email) {
          await webrtcPeer.createOffer(user.email);
        }
      } catch (err) {
        console.error("❌ WebRTC init:", err);
        setToast({ message: err.message || "Media access failed", type: "error", duration: 5000 });
      }
    })();

    window.addEventListener("screenshare-ended", () => setScreenSharing(false));
    return () => {
      window.removeEventListener("screenshare-ended", () => setScreenSharing(false));
      activeSpeakerService.destroy();
    };
  }, [lobbyDone]); // eslint-disable-line

  // ── Remote stream events ───────────────────────────────────────────────────
  useEffect(() => {
    const onAdded = ({ detail: { participantEmail, stream } }) => {
      remoteVidsRef.current[participantEmail] = stream;
      if (!isMultiParty && remoteVidRef.current) {
        remoteVidRef.current.srcObject = stream;
        remoteVidRef.current.muted = false;
      }
      if (remoteAudRef.current && type === "voice") {
        remoteAudRef.current.srcObject = stream;
      }
      // Add to active speaker detection
      activeSpeakerService.addStream(participantEmail, stream);
      setConnected(true);
      setParticipants((p) => [...p]);
    };
    const onRemoved = ({ detail: { participantEmail } }) => {
      delete remoteVidsRef.current[participantEmail];
      activeSpeakerService.removeStream(participantEmail);
      setParticipants((p) => [...p]);
    };
    window.addEventListener("remote_stream_added", onAdded);
    window.addEventListener("remote_stream_removed", onRemoved);
    return () => {
      window.removeEventListener("remote_stream_added", onAdded);
      window.removeEventListener("remote_stream_removed", onRemoved);
    };
  }, [isMultiParty, type]);

  // ── Active speaker from service ────────────────────────────────────────────
  useEffect(() => {
    const handler = ({ detail: { email } }) => setActiveSpeaker(email);
    window.addEventListener("active_speaker_changed", handler);
    return () => window.removeEventListener("active_speaker_changed", handler);
  }, []);

  // ── Offer after accept ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isInitiator && !waitingForAccept && callState === "connected" && user?.email) {
      webrtcPeer.createOffer(user.email).catch(console.error);
    }
  }, [isInitiator, waitingForAccept, callState]); // eslint-disable-line

  // ── Pending offer / create_offer_for ──────────────────────────────────────
  useEffect(() => {
    const onPending = async ({ detail: { fromEmail, sdp } }) => {
      if (webrtcPeer.localStream) await webrtcPeer.handleOffer(fromEmail, sdp);
    };
    const onCreateFor = async ({ detail: { participantEmail } }) => {
      if (webrtcPeer.localStream) await webrtcPeer.createOffer(participantEmail);
    };
    window.addEventListener("pending_offer", onPending);
    window.addEventListener("create_offer_for", onCreateFor);
    return () => {
      window.removeEventListener("pending_offer", onPending);
      window.removeEventListener("create_offer_for", onCreateFor);
    };
  }, []);

  // ── Signal events ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onRaise = ({ detail: { fromEmail, handRaised: r, callId: sid } }) => {
      if (sid !== callId) return;
      setToast({ message: r ? `${fromEmail.split("@")[0]} raised hand ✋` : `${fromEmail.split("@")[0]} lowered hand`, type: "info", duration: 2000 });
    };
    const onMute = ({ detail: { fromEmail, audioEnabled, callId: sid } }) => {
      if (sid !== callId) return;
      setToast({ message: audioEnabled ? `${fromEmail.split("@")[0]} unmuted 🎙` : `${fromEmail.split("@")[0]} muted 🔇`, type: "info", duration: 2000 });
    };
    const onHostMute = () => {
      setMicOn(false);
      webrtcPeer.toggleAudio(false);
      setToast({ message: "You were muted by the host", type: "info", duration: 4000 });
    };
    const onRemoved = () => {
      setToast({ message: "You were removed from the call", type: "error", duration: 4000 });
      setTimeout(() => onEnd?.(), 2000);
    };
    window.addEventListener("raise_hand_signal", onRaise);
    window.addEventListener("mute_state_signal", onMute);
    window.addEventListener("host_muted_me", onHostMute);
    window.addEventListener("removed_from_call", onRemoved);
    return () => {
      window.removeEventListener("raise_hand_signal", onRaise);
      window.removeEventListener("mute_state_signal", onMute);
      window.removeEventListener("host_muted_me", onHostMute);
      window.removeEventListener("removed_from_call", onRemoved);
    };
  }, [callId, onEnd]);

  // ── Reactions ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = ({ detail: { fromEmail, fromName, emoji, callId: sid } }) => {
      if (sid !== callId) return;
      addReaction(emoji, fromName || fromEmail?.split("@")[0]);
    };
    window.addEventListener("call_reaction", handler);
    return () => window.removeEventListener("call_reaction", handler);
  }, [callId, addReaction]);

  // ── Waiting room events ────────────────────────────────────────────────────
  useEffect(() => {
    const onJoin = ({ detail: { email, name } }) => {
      setToast({
        message: `${name || email} is waiting to join`,
        type: "info",
        duration: 8000,
      });
      // Auto-open waiting room panel
      setPanel("waitingRoom");
    };
    const onAdmitted = () => {
      setToast({ message: "You have been admitted to the call", type: "success", duration: 2000 });
    };
    const onDenied = () => {
      setToast({ message: "Your request to join was declined", type: "error", duration: 4000 });
      setTimeout(() => onEnd?.(), 2000);
    };
    window.addEventListener("waiting_room_join", onJoin);
    window.addEventListener("waiting_room_admitted", onAdmitted);
    window.addEventListener("waiting_room_denied", onDenied);
    return () => {
      window.removeEventListener("waiting_room_join", onJoin);
      window.removeEventListener("waiting_room_admitted", onAdmitted);
      window.removeEventListener("waiting_room_denied", onDenied);
    };
  }, [onEnd]);

  // ── Recording events ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = ({ detail: { isRecording: rec, startedBy, url } }) => {
      setRecordingActive(rec);
      if (rec) {
        setToast({ message: `Recording started by ${startedBy?.split("@")[0] || "host"}`, type: "info", duration: 4000 });
      } else {
        setToast({ message: url ? "Recording saved" : "Recording stopped", type: "success", duration: 4000 });
      }
    };
    window.addEventListener("recording_state_changed", handler);
    return () => window.removeEventListener("recording_state_changed", handler);
  }, []);

  // ── In-call chat ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = ({ detail: { fromEmail, fromName, message, timestamp, callId: sid } }) => {
      if (sid !== callId) return;

      // Ignore messages from ourselves — we already added them locally in sendChat
      if (fromEmail?.toLowerCase() === myEmail?.toLowerCase()) return;

      // Use fromName if available, otherwise extract from email
      const senderName = (fromName && fromName !== fromEmail)
        ? fromName
        : fromEmail?.split("@")[0] || "Unknown";

      setChatMsgs((prev) => [
        ...prev,
        {
          sender: senderName,
          isSelf: false,
          text: message,
          time: new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      if (panel !== "chat") setUnread((u) => u + 1);
    };
    window.addEventListener("call_chat_message", handler);
    return () => window.removeEventListener("call_chat_message", handler);
  }, [callId, panel, myEmail]);

  // ── Chat scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (panel === "chat") chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs, panel]);

  // ── Devices ────────────────────────────────────────────────────────────────
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devs) => {
      setAudioDevices(devs.filter((d) => d.kind === "audioinput"));
      setVideoDevices(devs.filter((d) => d.kind === "videoinput"));
      setOutputDevices(devs.filter((d) => d.kind === "audiooutput"));
      const ai = devs.find((d) => d.kind === "audioinput");
      const vi = devs.find((d) => d.kind === "videoinput");
      const ao = devs.find((d) => d.kind === "audiooutput");
      if (ai) setSelAudio(ai.deviceId);
      if (vi) setSelVideo(vi.deviceId);
      if (ao) setSelOutput(ao.deviceId);
    }).catch(() => {});
  }, []);

  // ── Drag ───────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback(
    (e) => {
      if (fullscreen) return;
      // Drag from anywhere on the header (cs-drag-handle covers the whole header)
      if (!e.target.closest(".cs-drag-handle")) return;
      // Don't drag when clicking buttons inside the header
      if (e.target.closest("button")) return;
      e.preventDefault();
      setDragging(true);
      dragOff.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    },
    [fullscreen, pos]
  );

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const nx = e.clientX - dragOff.current.x;
      const ny = e.clientY - dragOff.current.y;
      const w   = callBoxRef.current?.offsetWidth  || (isMinimized ? 280 : 900);
      const h   = callBoxRef.current?.offsetHeight || (isMinimized ? 56  : 600);
      const mxX = window.innerWidth  - w;
      const mxY = window.innerHeight - h;
      setPos({ x: Math.max(0, Math.min(nx, mxX)), y: Math.max(0, Math.min(ny, mxY)) });
    };
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging, isMinimized]);

  // ── Controls ──────────────────────────────────────────────────────────────

  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    webrtcPeer.toggleAudio(next);
    broadcastMediaState(next, undefined);
  };

  const toggleCam = async () => {
    const next = !camOn;
    setCamOn(next);
    try {
      if (next) {
        if (type === "voice") {
          await webrtcPeer.addCamera();
        } else {
          webrtcPeer.toggleVideo(true);
        }
        if (localVidRef.current && webrtcPeer.localStream) {
          localVidRef.current.srcObject = webrtcPeer.localStream;
        }
      } else {
        if (type === "voice") {
          await webrtcPeer.removeCamera();
          if (localVidRef.current) localVidRef.current.srcObject = null;
        } else {
          webrtcPeer.toggleVideo(false);
        }
      }
      broadcastMediaState(undefined, next);
    } catch (err) {
      setCamOn(!next);
      setToast({ message: "Camera toggle failed", type: "error", duration: 2000 });
    }
  };

  const toggleScreen = async () => {
    try {
      if (!screenSharing) {
        await webrtcPeer.startScreenShare();
        setScreenSharing(true);
        setToast({ message: "Screen sharing started", type: "info", duration: 2000 });
      } else {
        await webrtcPeer.stopScreenShare();
        setScreenSharing(false);
        setToast({ message: "Screen sharing stopped", type: "info", duration: 2000 });
      }
    } catch (err) {
      if (err.message !== "User cancelled screen sharing") {
        setToast({ message: "Screen share failed", type: "error", duration: 4000 });
      }
    }
  };

  const toggleNoiseSuppression = async () => {
    const next = !noiseSuppression;
    setNoiseSuppression(next);
    // Restart local media with updated constraint
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: next, autoGainControl: next },
        video: type === "video" ? true : false,
      });
      if (webrtcPeer.localStream) {
        const oldAudio = webrtcPeer.localStream.getAudioTracks()[0];
        if (oldAudio) {
          webrtcPeer.localStream.removeTrack(oldAudio);
          oldAudio.stop();
        }
        const newAudio = stream.getAudioTracks()[0];
        if (newAudio) {
          webrtcPeer.localStream.addTrack(newAudio);
          await webrtcPeer.replaceAudioTrack(newAudio);
        }
      }
      setToast({ message: `Noise suppression ${next ? "ON" : "OFF"}`, type: "info", duration: 2500 });
    } catch (err) {
      console.warn("Noise suppression toggle failed:", err);
      setToast({ message: "Could not change noise suppression", type: "error", duration: 2000 });
    }
  };

  const toggleBackgroundBlur = () => {
    const next = !backgroundBlur;
    setBackgroundBlur(next);
    setToast({ message: `Background blur ${next ? "ON" : "OFF"}`, type: "info", duration: 2500 });
  };

  const toggleFullscreen = () => {
    if (!fullscreen) callBoxRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
    setFullscreen((f) => !f);
  };

  const togglePanel = (name) => {
    setPanel((p) => (p === name ? null : name));
    if (name === "chat") setUnread(0);
  };

  const raiseHand = () => {
    const next = !handRaised;
    setHandRaised(next);
    broadcastRaiseHand(next);
    setToast({ message: next ? "Hand raised ✋" : "Hand lowered", type: "info", duration: 2500 });
  };

  const endCall = () => {
    webrtcPeer.close();
    activeSpeakerService.destroy();
    ringRef.current?.pause();
    localStorage.removeItem("ongoingCall");
    onEnd();
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const msg = {
      sender: "You",
      isSelf: true,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMsgs((prev) => [...prev, msg]);

    // Send ONE message to the backend — it broadcasts to all other participants.
    // The backend uses activeGroupCalls to find all recipients (excluding sender).
    // We include toEmail as a fallback for 1-on-1 calls where activeGroupCalls may not be populated.
    const fallbackTarget = participants.length > 0
      ? participants[0].email
      : user?.email;

    sendCallChatMessage({
      fromEmail: myEmail,
      fromName: myName,
      toEmail: fallbackTarget || "",   // fallback for 1-on-1
      callId,
      message: msg.text,
      timestamp: new Date().toISOString(),
    });

    setChatInput("");
  };

  const handleReact = (emoji) => {
    addReaction(emoji, "You");
    broadcastReaction(emoji);
  };

  const startRecording = () => {
    setRecordingActive(true);
    sendRecordingStarted({ fromEmail: myEmail, toEmail: myEmail, callId, type: type?.toUpperCase() });
    setToast({ message: "Recording started 🔴", type: "info", duration: 2000 });
  };

  const stopRecording = () => {
    setRecordingActive(false);
    sendRecordingStopped({ fromEmail: myEmail, toEmail: myEmail, callId, type: type?.toUpperCase() });
    setToast({ message: "Recording stopped", type: "success", duration: 2000 });
  };

  // ── Device switching (wired to actual WebRTC track replacement) ────────────
  const handleAudioChange = async (deviceId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId }, noiseSuppression, echoCancellation: true },
      });
      const newTrack = stream.getAudioTracks()[0];
      if (newTrack) {
        await webrtcPeer.replaceAudioTrack(newTrack);
        setToast({ message: "Microphone changed", type: "info", duration: 2000 });
      }
    } catch (err) {
      setToast({ message: "Failed to switch microphone", type: "error", duration: 2000 });
    }
  };

  const handleVideoChange = async (deviceId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      const newTrack = stream.getVideoTracks()[0];
      if (newTrack) {
        await webrtcPeer.replaceVideoTrack(newTrack);
        if (localVidRef.current && webrtcPeer.localStream) {
          localVidRef.current.srcObject = webrtcPeer.localStream;
        }
        setToast({ message: "Camera changed", type: "info", duration: 2000 });
      }
    } catch (err) {
      setToast({ message: "Failed to switch camera", type: "error", duration: 2000 });
    }
  };

  const handleOutputChange = async (deviceId) => {
    try {
      for (const el of [remoteVidRef.current, remoteAudRef.current]) {
        if (el && typeof el.setSinkId === "function") {
          await el.setSinkId(deviceId);
        }
      }
      setToast({ message: "Speaker changed", type: "info", duration: 2000 });
    } catch (err) {
      setToast({ message: "Failed to switch speaker", type: "error", duration: 2000 });
    }
  };

  // ── Grid layout ────────────────────────────────────────────────────────────
  const gridCols = (n) => {
    if (n <= 1) return "1fr";
    if (n <= 2) return "1fr 1fr";
    if (n <= 4) return "1fr 1fr";
    if (n <= 6) return "1fr 1fr 1fr";
    return "repeat(auto-fit, minmax(200px, 1fr))";
  };

  const allTiles = (() => {
    const seen = new Set();
    const tiles = [];

    // Self tile always first
    const selfEmail = myEmail?.toLowerCase();
    seen.add(selfEmail);
    tiles.push({
      email: selfEmail,
      name: myName,
      isSelf: true,
      stream: null,
      audioEnabled: micOn,
      videoEnabled: camOn,
      handRaised,
      connectionState: "connected",
    });

    // Remote participants — deduplicate by email, filter out self
    for (const p of participants) {
      const pEmail = p.email?.toLowerCase();
      if (!pEmail || seen.has(pEmail)) continue;
      seen.add(pEmail);

      // Resolve display name: prefer stored name if it's not an email
      const pName = (p.name && !p.name.includes("@"))
        ? p.name
        : pEmail.split("@")[0];

      tiles.push({
        ...p,
        email: pEmail,
        isSelf: false,
        name: pName,
        stream: remoteVidsRef.current[pEmail] || remoteVidsRef.current[p.email] || null,
      });
    }

    return tiles;
  })();

  const windowStyle = fullscreen
    ? {}
    : isMinimized
      ? { left: pos.x, top: pos.y, width: 280, height: "auto" }
      : { left: pos.x, top: pos.y };

  // ── Auto-dismiss lobby when call is accepted (sender side) ───────────────
  // When the receiver accepts, callState changes to 'connected' and waitingForAccept
  // becomes false. At that point, auto-proceed past the lobby on the sender side.
  useEffect(() => {
    if (!lobbyDone && isInitiator && callState === 'connected' && !waitingForAccept) {
      setLobbyDone(true);
    }
  }, [lobbyDone, isInitiator, callState, waitingForAccept]);

  // ── Show lobby before joining ──────────────────────────────────────────────
  // Only show lobby for INCOMING calls so the receiver can preview camera/mic.
  // Outgoing calls skip the lobby — the sender already initiated the call.
  // Already-accepted calls (receiver navigated from GlobalCallNotification) also skip.
  const shouldShowLobby = !lobbyDone && isIncomingRinging;

  if (shouldShowLobby) {
    return createPortal(
      <CallLobby
        callerName={user?.name || user?.email}
        callType={type}
        isIncoming={true}
        onJoin={({ micOn: m, camOn: c }) => {
          setMicOn(m);
          setCamOn(c);
          setLobbyDone(true);
          // Accept the call — sends ACCEPT signal to caller
          if (onAccept) onAccept();
        }}
        onDecline={() => {
          if (onReject) onReject();
          else if (onEnd) onEnd();
        }}
      />,
      document.body
    );
  }

  // For outgoing calls or already-accepted calls, skip lobby immediately.
  if (!lobbyDone) {
    // Use setTimeout to avoid setState-during-render warning
    setTimeout(() => setLobbyDone(true), 0);
  }

  // ── Minimized bar ─────────────────────────────────────────────────────────
  if (isMinimized) {
    return createPortal(
      <div
        ref={callBoxRef}
        className={`cs-window cs-minimized-bar${dragging ? " cs-dragging" : ""}`}
        style={windowStyle}
        onMouseDown={onMouseDown}
        role="dialog"
        aria-label="Call window minimized"
      >
        <audio ref={ringRef} loop><source src="/sounds/ring.mp3" type="audio/mpeg" /></audio>
        <audio ref={remoteAudRef} autoPlay playsInline style={{ display: "none" }} />
        <div className="cs-drag-handle cs-minimized-inner">
          <div className="cs-minimized-info">
            <span className="cs-minimized-name">
              {isMultiParty ? `Group call · ${allTiles.length}` : (user?.name || user?.email)}
            </span>
            <span className={`cs-minimized-status${isConnected ? " cs-status-live" : ""}`}>
              {isConnected && <span className="cs-live-dot" />}
              {statusText()}
            </span>
          </div>
          <div className="cs-minimized-actions">
            <button
              className="cs-icon-btn"
              title="Restore"
              onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
              aria-label="Restore call window"
            >
              <FaExpand />
            </button>
            <button
              className="cs-icon-btn cs-icon-btn--danger"
              title="End call"
              onClick={(e) => { e.stopPropagation(); onEnd(); }}
              aria-label="End call"
            >
              <FaPhoneSlash />
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return createPortal(
    <div
      ref={callBoxRef}
      className={`cs-window${fullscreen ? " cs-fullscreen" : ""}${dragging ? " cs-dragging" : ""}`}
      style={windowStyle}
      onMouseDown={onMouseDown}
      role="dialog"
      aria-label="Call window"
    >
      {/* Hidden audio */}
      <audio ref={ringRef} loop>
        <source src="/sounds/ring.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={remoteAudRef} autoPlay playsInline style={{ display: "none" }} />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="cs-header cs-drag-handle">
        <div className="cs-header-info">
          <span className="cs-header-name">
            {isMultiParty ? `Group call · ${allTiles.length} people` : (user?.name || user?.email)}
          </span>
          <span className={`cs-header-status${isConnected ? " cs-status-live" : ""}`}>
            {isConnected && <span className="cs-live-dot" aria-hidden="true" />}
            {statusText()}
            {(recordingActive || isRecording) && (
              <span className="cs-rec-badge" title="Recording in progress">
                <FaCircle className="cs-rec-dot" /> REC
              </span>
            )}
          </span>
        </div>
        <div className="cs-header-actions">
          <CallQuality />
          <button
            className="cs-icon-btn"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(true); setPos(p => ({ x: p.x, y: window.innerHeight - 70 })); }}
            title="Minimize"
            aria-label="Minimize call window"
          >
            <FaWindowMinimize />
          </button>
          <button className="cs-icon-btn" onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} title={fullscreen ? "Exit fullscreen" : "Fullscreen"} aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
            {fullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div className="cs-body">

        {/* ── STAGE ─────────────────────────────────────────────────────── */}
        <div className="cs-stage">

          {/* Screen share banner */}
          {screenSharing && (
            <div className="cs-screenshare-banner" role="status">
              <MdScreenShare aria-hidden="true" /> You are sharing your screen
              <button onClick={toggleScreen} className="cs-stop-share-btn">Stop sharing</button>
            </div>
          )}

          {/* Incoming call overlay */}
          {isIncomingRinging && (
            <div className="cs-incoming-overlay" role="alertdialog" aria-label="Incoming call">
              <div className="cs-incoming-avatar" aria-hidden="true">{initials(user?.name || user?.email)}</div>
              <p className="cs-incoming-name">{user?.name || user?.email}</p>
              <p className="cs-incoming-sub">Incoming {type === "video" ? "video" : "voice"} call</p>
              <div className="cs-incoming-btns">
                <button className="cs-accept-btn" onClick={onAccept} aria-label="Accept call">
                  <FaPhone aria-hidden="true" /> Accept
                </button>
                <button className="cs-reject-btn" onClick={onReject} aria-label="Decline call">
                  <FaPhoneSlash aria-hidden="true" /> Decline
                </button>
              </div>
            </div>
          )}

          {/* Waiting / calling overlay */}
          {!isIncomingRinging && !isConnected && (
            <div className="cs-waiting-overlay" role="status">
              <div className="cs-waiting-avatar" aria-hidden="true">
                {initials(user?.name || user?.email)}
                <div className="cs-pulse-ring" />
                <div className="cs-pulse-ring cs-pr2" />
                <div className="cs-pulse-ring cs-pr3" />
              </div>
              <p className="cs-waiting-name">{user?.name || user?.email}</p>
              <p className="cs-waiting-status">{statusText()}</p>
            </div>
          )}

          {/* Video grid */}
          {isConnected && (
            <div
              className="cs-grid"
              style={{ gridTemplateColumns: gridCols(allTiles.length) }}
              role="list"
              aria-label="Call participants"
            >
              {allTiles.map((tile, idx) => (
                <TileView
                  key={tile.email || `tile-${idx}`}
                  tile={tile}
                  localVidRef={tile.isSelf ? localVidRef : null}
                  isActiveSpeaker={activeSpeaker === tile.email}
                  initials={initials}
                  backgroundBlur={backgroundBlur}
                />
              ))}
            </div>
          )}

          {/* Floating reactions */}
          <FloatingReactions reactions={reactions} />

          {/* Muted badge */}
          {!micOn && isConnected && (
            <div className="cs-muted-badge" role="status" aria-live="polite">
              <FaMicrophoneSlash aria-hidden="true" /> Muted
            </div>
          )}

          {/* Waiting room badge */}
          {waitingRoom.length > 0 && (
            <button
              className="cs-waiting-room-badge"
              onClick={() => togglePanel("waitingRoom")}
              aria-label={`${waitingRoom.length} people waiting to join`}
            >
              👋 {waitingRoom.length} waiting
            </button>
          )}
        </div>

        {/* ── SIDE PANEL ────────────────────────────────────────────────── */}
        {panel && panel !== "add" && (
          <div className="cs-side-panel" role="complementary">
            {panel === "chat" && (
              <ChatPanel
                msgs={chatMsgs}
                input={chatInput}
                setInput={setChatInput}
                onSend={sendChat}
                chatEndRef={chatEndRef}
                onClose={() => setPanel(null)}
              />
            )}
            {panel === "people" && (
              <PeoplePanel
                participants={participants}
                myInitials={myInitials}
                micOn={micOn}
                camOn={camOn}
                handRaised={handRaised}
                initials={initials}
                onMute={muteParticipant}
                onRemove={removeParticipantFromCall}
                onClose={() => setPanel(null)}
              />
            )}
            {panel === "settings" && (
              <SettingsPanel
                audioDevices={audioDevices}
                videoDevices={videoDevices}
                outputDevices={outputDevices}
                selAudio={selAudio}
                selVideo={selVideo}
                selOutput={selOutput}
                setSelAudio={setSelAudio}
                setSelVideo={setSelVideo}
                setSelOutput={setSelOutput}
                micOn={micOn}
                camOn={camOn}
                noiseSuppression={noiseSuppression}
                backgroundBlur={backgroundBlur}
                onToggleNoise={toggleNoiseSuppression}
                onToggleBlur={toggleBackgroundBlur}
                onClose={() => setPanel(null)}
                onAudioChange={handleAudioChange}
                onVideoChange={handleVideoChange}
                onOutputChange={handleOutputChange}
              />
            )}
            {panel === "waitingRoom" && (
              <WaitingRoomPanel
                waitingRoom={waitingRoom}
                onAdmit={admitFromWaitingRoom}
                onDeny={denyFromWaitingRoom}
                onClose={() => setPanel(null)}
              />
            )}
          </div>
        )}
      </div>

      {/* ── CONTROL BAR ─────────────────────────────────────────────────── */}
      {!isIncomingRinging && (
        <div className="cs-controls" role="toolbar" aria-label="Call controls">

          {/* Left: timer + quality */}
          <div className="cs-controls-left">
            <span className="cs-ctrl-time" aria-live="off">
              {isConnected ? fmt() : statusText()}
            </span>
          </div>

          {/* Center: main controls */}
          <div className="cs-controls-center">
            <CtrlBtn active={micOn} danger={!micOn} onClick={toggleMic} title={micOn ? "Mute" : "Unmute"}>
              {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
              <span>{micOn ? "Mute" : "Unmute"}</span>
            </CtrlBtn>

            <CtrlBtn active={camOn} danger={!camOn} onClick={toggleCam} title={camOn ? "Stop video" : "Start video"}>
              {camOn ? <FaVideo /> : <FaVideoSlash />}
              <span>{camOn ? "Stop video" : "Start video"}</span>
            </CtrlBtn>

            <CtrlBtn active={screenSharing} onClick={toggleScreen} title={screenSharing ? "Stop sharing" : "Share screen"}>
              {screenSharing ? <MdStopScreenShare /> : <MdScreenShare />}
              <span>Share</span>
            </CtrlBtn>

            <CtrlBtn active={handRaised} onClick={raiseHand} title={handRaised ? "Lower hand" : "Raise hand"}>
              <FaHandPaper />
              <span>Hand</span>
            </CtrlBtn>

            {/* Reactions */}
            <ReactionsBar onReact={handleReact} />

            {/* Leave */}
            <button className="cs-leave-btn" onClick={endCall} title="Leave call" aria-label="Leave call">
              <FaSignOutAlt />
              <span>Leave</span>
            </button>
          </div>

          {/* Right: panels + add + record */}
          <div className="cs-controls-right">
            <CtrlBtn
              active={panel === "chat"}
              onClick={() => togglePanel("chat")}
              title="Chat"
              badge={unread}
            >
              <FaCommentAlt />
              <span>Chat</span>
            </CtrlBtn>

            <CtrlBtn
              active={panel === "people"}
              onClick={() => togglePanel("people")}
              title="People"
              badge={waitingRoom.length}
            >
              <FaUsers />
              <span>People</span>
            </CtrlBtn>

            <CtrlBtn
              active={panel === "settings"}
              onClick={() => togglePanel("settings")}
              title="Settings"
            >
              <FaCog />
              <span>Settings</span>
            </CtrlBtn>

            <CtrlBtn onClick={() => setPanel("add")} title="Add people">
              <FaUserPlus />
              <span>Add</span>
            </CtrlBtn>

            {/* Record button */}
            <CtrlBtn
              active={recordingActive || isRecording}
              danger={recordingActive || isRecording}
              onClick={recordingActive || isRecording ? stopRecording : startRecording}
              title={recordingActive || isRecording ? "Stop recording" : "Start recording"}
            >
              {recordingActive || isRecording ? <FaStopCircle /> : <FaCircle />}
              <span>{recordingActive || isRecording ? "Stop rec" : "Record"}</span>
            </CtrlBtn>
          </div>
        </div>
      )}

      {/* ── ADD PARTICIPANT MODAL ────────────────────────────────────────── */}
      <AddParticipantModal
        isOpen={panel === "add"}
        onClose={() => setPanel(null)}
        onAddParticipant={(emp) => {
          addParticipantToCall(emp);
          setPanel(null);
          setToast({ message: `Invited ${emp.name || emp.email}`, type: "success", duration: 2000 });
        }}
        currentUser={user}
      />

      {/* ── TOAST ───────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration || 3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>,
    document.body
  );
}

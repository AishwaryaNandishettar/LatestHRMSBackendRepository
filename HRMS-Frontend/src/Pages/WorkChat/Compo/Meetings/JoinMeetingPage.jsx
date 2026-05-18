<<<<<<< HEAD
import { useContext, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../../../Context/Authcontext";
import MeetingRoom from "./MeetingRoom";
import { fetchMeetingById } from "../../../../api/meetingApi";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "./JoinMeetingPage.css";
=======
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../../../Context/Authcontext";
import { useCall } from "../../../../Context/CallContext";
import CallScreen from "../CallScreen";
import JoinMeeting from "./JoinMeeting";
import { fetchMeetingById } from "../../../../api/meetingApi";
import { sendCallSignal } from "../../../../api/socket";
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6

export default function JoinMeetingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
<<<<<<< HEAD
  const { token: contextToken, user } = useContext(AuthContext);

  const [meeting, setMeeting]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [authRequired, setAuth]     = useState(false);
  const [inMeeting, setInMeeting]   = useState(false);
  const [stompReady, setStompReady] = useState(false);
  // ownedClient = true when WE created the STOMP client (must deactivate on unmount)
  // ownedClient = false when we reused the global window.stompClient
  const stompRef    = useRef(null);
  const ownedClient = useRef(false);

  const token = useMemo(() => {
    if (contextToken) return contextToken;
    return localStorage.getItem("token") || null;
  }, [contextToken]);

  const currentUserEmail = useMemo(() => {
    if (user?.email) return user.email.trim().toLowerCase();
    if (user?.userEmail) return user.userEmail.trim().toLowerCase();
    try {
      const s = localStorage.getItem("loggedUser");
      if (s) {
        const p = JSON.parse(s);
        const e = p.email || p.userEmail;
        return e ? e.trim().toLowerCase() : null;
      }
    } catch {}
    return null;
  }, [user]);

  useEffect(() => { document.title = "Join Meeting"; }, []);

  // ── fetch meeting ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    if (!token) { setAuth(true); setLoading(false); return; }
    setAuth(false); setLoading(true); setError(null);
    fetchMeetingById(id, token)
      .then(setMeeting)
      .catch(err => {
        const s = err.response?.status;
        if (s === 401) setAuth(true);
        else if (s === 403) setError("You are not authorized to join this meeting.");
        else if (s === 404) setError("Meeting not found.");
        else setError("Unable to load meeting details. Please try again.");
=======
  const { token } = useContext(AuthContext);
  const { call, incomingCall, callState, startCall, endCall, acceptCall, rejectCall } = useCall();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authRequired, setAuthRequired] = useState(false);

  const currentUserEmail = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("loggedUser");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const email = parsed.email || parsed.userEmail;
        return email ? email.trim().toLowerCase() : null;
      }
    } catch (e) {
      console.error("[JoinMeetingPage] Failed to parse loggedUser", e);
    }
    return null;
  }, []);

  useEffect(() => {
    document.title = `Join Meeting ${id}`;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (!token) {
      setAuthRequired(true);
      setLoading(false);
      return;
    }

    setAuthRequired(false);
    setLoading(true);
    setError(null);

    fetchMeetingById(id, token)
      .then((data) => {
        setMeeting(data);
      })
      .catch((err) => {
        console.error("[JoinMeetingPage] Failed to load meeting", err);
        setError(
          err.response?.status === 403
            ? "You are not authorized to join this meeting."
            : err.response?.status === 404
            ? "Meeting not found."
            : "Unable to load meeting details. Please try again."
        );
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6
      })
      .finally(() => setLoading(false));
  }, [id, token]);

<<<<<<< HEAD
  // ── STOMP connection: reuse global if available, otherwise create one ──────
  // This fixes the duplicate WebSocket connection bug: CallContext already
  // establishes a global STOMP client on login (window.stompClient). We reuse
  // it instead of opening a second connection to the same /ws endpoint.
  useEffect(() => {
    if (!inMeeting || !token || stompRef.current) return;

    // Reuse the global STOMP client created by CallContext if it's connected
    if (window.stompClient?.connected) {
      stompRef.current = window.stompClient;
      ownedClient.current = false;
      setStompReady(true);
      return;
    }

    // Fallback: create a dedicated STOMP client (e.g. user opened link directly
    // without going through the main app, so CallContext never ran)
    const wsBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082";
    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsBase}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        stompRef.current = client;
        ownedClient.current = true;
        setStompReady(true);
      },
      onStompError: () => {
        setError("Could not connect to meeting server. Please try again.");
        setInMeeting(false);
      },
      onDisconnect: () => {
        setStompReady(false);
      },
    });
    client.activate();

    return () => {
      // Only deactivate if WE created this client
      if (ownedClient.current) {
        client.deactivate();
        ownedClient.current = false;
      }
      stompRef.current = null;
      setStompReady(false);
    };
  }, [inMeeting, token]);

  const isHost = !!meeting && !!currentUserEmail &&
    meeting.createdByEmail?.trim().toLowerCase() === currentUserEmail;
  const isParticipant = !!meeting && !!currentUserEmail &&
    meeting.participantEmails?.some(e => e?.trim().toLowerCase() === currentUserEmail);
  const canJoin = isHost || isParticipant;

  const handleJoin = () => {
    if (!canJoin) return;
    const now   = new Date();
    const start = new Date(meeting.startTime);
    const end   = new Date(meeting.endTime);
    if (now < new Date(start.getTime() - 15 * 60 * 1000)) {
      alert(`Meeting starts at ${start.toLocaleString()}. You can join 15 minutes before.`);
      return;
    }
    if (now > end) { alert("This meeting has already ended."); return; }
    setInMeeting(true);
  };

  const handleLeave = () => {
    // Only deactivate if we own the STOMP client (not the global one)
    if (ownedClient.current && stompRef.current) {
      stompRef.current.deactivate();
      ownedClient.current = false;
    }
    stompRef.current = null;
    setInMeeting(false);
    setStompReady(false);
    navigate("/workchat");
  };

  // ── auth required ──────────────────────────────────────────────────────────
  if (authRequired) {
    return (
      <div className="jmp-page">
        <div className="jmp-lobby">
          <div className="jmp-logo">📅</div>
          <h2 className="jmp-title">Sign in required</h2>
          <p className="jmp-description">You need to sign in to join this meeting.</p>
          <div className="jmp-actions">
            <button className="jmp-btn jmp-btn--primary" onClick={() => {
              sessionStorage.setItem("postLoginRedirect", window.location.pathname);
              navigate("/");
            }}>Go to Login</button>
          </div>
=======
  const isHost = !!meeting &&
    currentUserEmail === meeting.createdByEmail?.trim().toLowerCase();

  const isParticipant = !!meeting &&
    meeting.participantEmails?.some(
      (email) => email?.trim().toLowerCase() === currentUserEmail
    );

  const canJoin = !!meeting && (isHost || isParticipant);

  const meetingTargetEmail = useMemo(() => {
    if (!meeting) return null;
    if (isHost) {
      return meeting.participantEmails?.find(
        (email) => email?.trim().toLowerCase() !== currentUserEmail
      );
    }
    return meeting.createdByEmail;
  }, [meeting, isHost, currentUserEmail]);

  const getJoinLabel = () => {
    if (!meeting) return "Join meeting";
    if (isHost) {
      return meetingTargetEmail ? "Start meeting" : "Waiting for participants";
    }
    return "Join meeting";
  };

  const handleJoin = () => {
    if (!meetingTargetEmail) {
      alert("No participant found to connect with yet.");
      return;
    }

    startCall("video", {
      email: meetingTargetEmail,
      name: meetingTargetEmail,
    });
  };

  const handleLeave = () => {
    if (call || incomingCall) {
      endCall();
    }
    navigate("/workchat");
  };

  if (authRequired) {
    return (
      <div className="join-meeting-page">
        <div className="join-meeting auth-required">
          <h2>Login required</h2>
          <p>You need to sign in before joining this meeting.</p>
          <button className="join-meeting-btn" onClick={() => navigate('/')}>Go to Login</button>
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  // ── connecting spinner ─────────────────────────────────────────────────────
  if (inMeeting && !stompReady) {
    return (
      <div className="jmp-page">
        <div className="jmp-lobby">
          <div className="jmp-spinner" />
          <p>Connecting to meeting server…</p>
        </div>
      </div>
    );
  }

  // ── in meeting ─────────────────────────────────────────────────────────────
  if (inMeeting && stompReady && stompRef.current && meeting) {
    return (
      <MeetingRoom
        meeting={meeting}
        stompClient={stompRef.current}
        onClose={handleLeave}
      />
    );
  }

  // ── lobby ──────────────────────────────────────────────────────────────────
  return (
    <div className="jmp-page">
      {loading && (
        <div className="jmp-lobby">
          <div className="jmp-spinner" />
          <p>Loading meeting details…</p>
        </div>
      )}

      {!loading && error && (
        <div className="jmp-lobby">
          <div className="jmp-error-icon">⚠️</div>
          <h2 className="jmp-title">Unable to join</h2>
          <p className="jmp-error-text">{error}</p>
          <div className="jmp-actions">
            <button className="jmp-btn jmp-btn--secondary" onClick={() => navigate("/workchat")}>
              Back to Work Chat
            </button>
          </div>
        </div>
      )}

      {!loading && !error && meeting && (
        <div className="jmp-lobby">
          <div className="jmp-logo">📅</div>
          <h1 className="jmp-title">{meeting.title}</h1>
          {meeting.description && <p className="jmp-description">{meeting.description}</p>}

          <div className="jmp-info-card">
            <div className="jmp-info-row">
              <span className="jmp-info-label">🕐 Start</span>
              <span className="jmp-info-value">
                {new Date(meeting.startTime).toLocaleString([], {
                  weekday: "short", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
            <div className="jmp-info-row">
              <span className="jmp-info-label">🕐 End</span>
              <span className="jmp-info-value">
                {new Date(meeting.endTime).toLocaleString([], {
                  weekday: "short", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
            <div className="jmp-info-row">
              <span className="jmp-info-label">👤 Organizer</span>
              <span className="jmp-info-value">{meeting.createdByEmail}</span>
            </div>
            {meeting.participantEmails?.length > 0 && (
              <div className="jmp-info-row">
                <span className="jmp-info-label">👥 Participants</span>
                <span className="jmp-info-value">{meeting.participantEmails.join(", ")}</span>
              </div>
            )}
            {meeting.remarks && (
              <div className="jmp-info-row">
                <span className="jmp-info-label">💬 Remarks</span>
                <span className="jmp-info-value">{meeting.remarks}</span>
              </div>
            )}
          </div>

          {meeting.status === "Cancelled" && (
            <div className="jmp-badge jmp-badge--cancelled">Meeting Cancelled</div>
          )}

          <div className="jmp-actions">
            {canJoin && meeting.status !== "Cancelled" ? (
              <button className="jmp-btn jmp-btn--primary" onClick={handleJoin}>
                {isHost ? "🚀 Start Meeting" : "🎥 Join Meeting"}
              </button>
            ) : !canJoin ? (
              <div className="jmp-badge jmp-badge--warning">
                You are not a participant of this meeting
              </div>
            ) : null}
            <button className="jmp-btn jmp-btn--secondary" onClick={() => navigate("/workchat")}>
              ← Back to Work Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
=======
  return (
    <div className="join-meeting-page">
      {(call || incomingCall) && (
        <CallScreen
          user={call?.user || {
            email: incomingCall?.fromEmail,
            name: incomingCall?.fromName || incomingCall?.fromEmail,
          }}
          type={call?.type || incomingCall?.type}
          onEnd={call ? endCall : rejectCall}
          onAccept={!call && incomingCall ? acceptCall : undefined}
          onReject={!call && incomingCall ? rejectCall : undefined}
          isInitiator={call?.isInitiator || false}
          callId={call?.callId || incomingCall?.callId}
          waitingForAccept={call?.waitingForAccept || (!!incomingCall && !call)}
          callState={callState}
          onSignal={(signal) => {
            const toEmail = call?.user?.email || incomingCall?.fromEmail;
            if (!toEmail) {
              console.warn('[JoinMeetingPage] Missing recipient email for signal', signal);
              return;
            }
            sendCallSignal({
              ...signal,
              fromEmail: currentUserEmail,
              toEmail,
            });
          }}
        />
      )}

      {!call && !incomingCall && (
        <JoinMeeting
          meeting={meeting}
          loading={loading}
          error={error}
          canJoin={canJoin}
          isHost={isHost}
          meetingTargetEmail={meetingTargetEmail}
          onJoin={handleJoin}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
}
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6

import {
  FaMicrophone,
  FaVideo,
  FaDesktop,
  FaPhoneSlash,
} from "react-icons/fa";

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

export default function JoinMeeting({
  meeting,
  loading,
  error,
  canJoin,
  isHost,
  meetingTargetEmail,
  onJoin,
  onLeave,
}) {
  if (loading) {
    return (
      <div className="join-meeting">
        <div className="join-meeting-loading">Loading meeting details…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="join-meeting">
        <div className="join-meeting-error">{error}</div>
        <button className="leave-meeting-btn" onClick={onLeave}>
          Back to Work Chat
        </button>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="join-meeting">
        <div className="join-meeting-error">Meeting details unavailable.</div>
        <button className="leave-meeting-btn" onClick={onLeave}>
          Back to Work Chat
        </button>
      </div>
    );
  }

  return (
    <div className="join-meeting">
      <div className="meeting-header">
        <span className="meeting-status">Live</span>
        <h2>{meeting.title || `Meeting ${meeting.id}`}</h2>
        <p>{meeting.description || "No description provided."}</p>
      </div>

      <div className="meeting-meta">
        <div>
          <strong>Organizer:</strong>
          <span>{meeting.createdByEmail || "Unknown"}</span>
        </div>

        <div>
          <strong>Starts:</strong>
          <span>{formatDateTime(meeting.startTime)}</span>
        </div>

        <div>
          <strong>Ends:</strong>
          <span>{formatDateTime(meeting.endTime)}</span>
        </div>

        <div>
          <strong>Participants:</strong>
          <span>
            {meeting.participantEmails?.length > 0
              ? meeting.participantEmails.join(", ")
              : "No participants added."}
          </span>
        </div>
      </div>

      <div className="meeting-video-placeholder">
        <div className="meeting-video-text">
          {canJoin
            ? "You can join this meeting now."
            : "You do not have permission to join this meeting."}
        </div>
      </div>

      <div className="meeting-actions">
        <button
          className="join-meeting-btn"
          onClick={onJoin}
          disabled={!canJoin || !meetingTargetEmail}
        >
          {canJoin
            ? isHost
              ? meetingTargetEmail
                ? "Start meeting"
                : "No participants to call"
              : "Join meeting"
            : "Cannot join"}
        </button>

        <button className="leave-meeting-btn" onClick={onLeave}>
          Leave
        </button>
      </div>

      <div className="meeting-fallback-note">
        {isHost && !meetingTargetEmail && (
          <p>
            This meeting has no remaining participants to call. Participants can join from their invitation links.
          </p>
        )}
      </div>
    </div>
  );
}
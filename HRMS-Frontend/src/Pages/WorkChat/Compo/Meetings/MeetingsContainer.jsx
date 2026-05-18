import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../../Context/Authcontext";

import MeetingForm from "./MeetingForm";
import MeetingCalendar from "./MeetingCalendar";

import { fetchMyMeetings } from "../../../../api/meetingApi";
import { fetchChatUsers } from "../../../../api/chatUsersApi";

/**
 * MeetingsContainer — shows the calendar and meeting form.
 *
 * Props:
 *   onClose()              — close the calendar panel
 *   onJoinMeeting(meeting) — called when the user confirms joining;
 *                            the parent (WorkChat) owns activeMeeting so
 *                            the meeting room survives this panel closing.
 */
export default function MeetingsContainer({ onClose, onJoinMeeting }) {
  const { user } = useContext(AuthContext);

  const [meetings, setMeetings]           = useState([]);
  const [users, setUsers]                 = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  /* ── Load meetings ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!user?.email || !user?.token) return;
    fetchMyMeetings(user.email, user.token)
      .then((data) => setMeetings(data))
      .catch(() => setMeetings([]));
  }, [user]);

  /* ── Load users for autosuggest ────────────────────────────────────────── */
  useEffect(() => {
    if (!user?.token) return;
    fetchChatUsers(user.token)
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [user]);

  /* ── 15-min notification ───────────────────────────────────────────────── */
  useEffect(() => {
    const timer = setInterval(() => {
      meetings.forEach((m) => {
        const diff = new Date(m.startTime) - new Date();
        if (diff < 15 * 60 * 1000 && diff > 14 * 60 * 1000) {
          alert(`Meeting "${m.title}" starts in 15 minutes`);
        }
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [meetings]);

  /* ── Calendar handlers ─────────────────────────────────────────────────── */
  const handleDateSelect = (date) => {
    const start = new Date(date);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start);
    end.setHours(11, 0, 0, 0);
    setSelectedMeeting({ startTime: start.toISOString(), endTime: end.toISOString() });
    setShowForm(true);
  };

  const handleEventEdit = (meeting) => {
    const now = new Date();
    if (new Date(meeting.endTime) < now) {
      alert('Cannot edit a meeting that has already ended.');
      return;
    }
    setSelectedMeeting(meeting);
    setShowForm(true);
  };

  /* ── Join handler — delegates to parent ───────────────────────────────── */
  const handleJoinMeeting = (meeting) => {
    const now = new Date();
    const start = new Date(meeting.startTime);
    const end   = new Date(meeting.endTime);
    const canJoinTime = new Date(start.getTime() - 15 * 60 * 1000);

    if (now < canJoinTime) {
      alert(`Meeting starts at ${start.toLocaleString()}. You can join 15 minutes before.`);
      return;
    }
    if (now > end) {
      alert('This meeting has already ended.');
      return;
    }

    // Hand off to WorkChat — it owns activeMeeting so the room survives
    // this panel closing.
    if (onJoinMeeting) onJoinMeeting(meeting);
  };

  return (
    <div className="wc-meetings">
      {/* HEADER */}
      <div className="wc-meetings-header">
        <h3>Meetings</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn-primary"
            onClick={() => { setSelectedMeeting(null); setShowForm(true); }}
          >
            + Schedule Meeting
          </button>
          <button onClick={onClose}>✕</button>
        </div>
      </div>

      {/* CALENDAR */}
      <MeetingCalendar
        meetings={meetings}
        onSelect={handleDateSelect}
        onEdit={handleEventEdit}
        onJoin={handleJoinMeeting}
      />

      {/* SCHEDULE / EDIT FORM */}
      {showForm && (
        <MeetingForm
          meeting={selectedMeeting}
          token={user.token}
          users={users}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            if (user?.email && user?.token) {
              fetchMyMeetings(user.email, user.token)
                .then(setMeetings)
                .catch(() => {});
            }
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

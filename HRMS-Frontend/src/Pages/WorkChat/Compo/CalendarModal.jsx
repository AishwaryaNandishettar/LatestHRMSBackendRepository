import { useEffect, useState } from "react";
import { fetchChatUsers } from "../../../api/chatUsersApi";
import { createMeeting } from "../../../api/meetingApi";

export default function CalendarModal({ token, loggedInEmail, onClose }) {
  const [title, setTitle] = useState("");
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    fetchChatUsers(token).then(setUsers);
  }, [token]);

  const toggleMember = (email) => {
    setMembers((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  const create = async () => {
    if (!title || !start || !end || members.length === 0) {
      alert("Fill all fields");
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate <= startDate) {
      alert("End date/time should be greater than start date/time");
      return;
    }

    // Convert datetime-local format to ISO 8601 format
    const formatDateTimeForBackend = (dateTimeLocal) => {
      if (!dateTimeLocal) return null;
      const date = new Date(dateTimeLocal);
      return date.toISOString();
    };

    await createMeeting(
      {
        title,
        participantEmails: [...members, loggedInEmail].filter(Boolean),
        createdByEmail: loggedInEmail,
        startTime: formatDateTimeForBackend(start),
        endTime: formatDateTimeForBackend(end),
      },
      token
    );

    onClose();
  };

  return (
    <div className="wc-modal-backdrop">
      <div className="wc-modal">
        <h3>Schedule Meeting</h3>

        <input
          placeholder="Meeting title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Start time</label>
        <input
          type="datetime-local"
          value={start}
          min={new Date().toISOString().slice(0, 16)}
          onChange={(e) => setStart(e.target.value)}
        />

        <label>End time</label>
        <input
          type="datetime-local"
          value={end}
          min={start || new Date().toISOString().slice(0, 16)}
          onChange={(e) => setEnd(e.target.value)}
        />

        <div className="wc-modal-users">
          {users.map((u) => (
            <label key={u.email}>
              <input
                type="checkbox"
                onChange={() => toggleMember(u.email)}
              />
              {u.name}
            </label>
          ))}
        </div>

        <div className="wc-modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={create}>Create</button>
        </div>
      </div>
    </div>
  );
}
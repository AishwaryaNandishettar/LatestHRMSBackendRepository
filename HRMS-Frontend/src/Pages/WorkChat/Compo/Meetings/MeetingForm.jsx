import { useEffect, useState } from "react";
import {
  createMeeting,
  updateMeeting,
  deleteMeeting,
  checkParticipantConflict
} from "../../../../api/meetingApi";
import {
  searchParticipants,
  fetchAllParticipants
} from "../../../../api/participantApi";
import AddParticipantModal from "../AddParticipantModal";
import "./MeetingForm.css";

export default function MeetingForm({
  meeting,
  token,
  users = [],
  onClose,
  onSaved,
}) {
  const [title, setTitle] = useState("");
  const [emails, setEmails] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [remarks, setRemarks] = useState("");

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [status, setStatus] = useState("Scheduled");
  const [repeat, setRepeat] = useState("none");
  
  // Validation state
  const [timeError, setTimeError] = useState("");
  const [pastTimeError, setPastTimeError] = useState("");

  // Conflict warnings: { email -> "conflicts with: Meeting Title" }
  const [conflictWarnings, setConflictWarnings] = useState({});
  
  const [repeatUntil, setRepeatUntil] = useState("");
  const [repeatCount, setRepeatCount] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);

  // Add Participant Modal state
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  
  // Get current user for the modal
  const currentUser = {
    email: localStorage.getItem('loggedUser') 
      ? JSON.parse(localStorage.getItem('loggedUser')).email 
      : null
  };

  // Format for datetime-local input (YYYY-MM-DDTHH:MM)
  const formatForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  /* PREFILL */
  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title || "");
      setEmails(meeting.participantEmails || []);
      setRemarks(meeting.remarks || ""); // ✅ ADD REMARKS PREFILL
      
      // Properly format the existing meeting times for datetime-local input
      if (meeting.startTime) {
        const startDate = new Date(meeting.startTime);
        setStart(formatForInput(startDate));
      }
      
      if (meeting.endTime) {
        const endDate = new Date(meeting.endTime);
        setEnd(formatForInput(endDate));
      }
      
      setStatus(meeting.status || "Scheduled");
      setRepeat(meeting.repeat || "none");
    } else {
      // New meeting mode - set default times
      const now = new Date();
      const startTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour from start
      
      setStart(formatForInput(startTime));
      setEnd(formatForInput(endTime));
    }
  }, [meeting]);

  /* AUTO-ADJUST END TIME WHEN START TIME CHANGES */
  useEffect(() => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const now = new Date();
      
      // Check if start time is in the past (only for new meetings)
      if (!meeting?.id && startDate <= now) {
        setPastTimeError("Cannot schedule meetings for past dates or times");
      } else {
        setPastTimeError("");
      }
      
      // If end time is before or equal to start time, auto-adjust it to 1 hour after start
      if (endDate <= startDate) {
        const newEndTime = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour
        setEnd(formatForInput(newEndTime));
        setTimeError("End time was automatically adjusted to be after start time");
        
        // Clear error after 3 seconds
        setTimeout(() => setTimeError(""), 3000);
      } else {
        setTimeError("");
      }
    }
  }, [start, meeting?.id]);

  /* SUGGEST USERS FROM API */
  useEffect(() => {
    if (!query) return setSuggestions([]);

    const fetchSuggestions = async () => {
      try {
        const results = await searchParticipants(query);
        // Filter out already added emails
        const filtered = results.filter(p => !emails.includes(p.email));
        setSuggestions(filtered);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    };

    // Debounce API calls
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query, emails]);

  /* HANDLE ADD PARTICIPANT FROM MODAL */
  const handleAddParticipant = async (employee) => {
    if (emails.includes(employee.email)) {
      setShowAddParticipantModal(false);
      return;
    }

    // Check for conflict if start/end times are already set
    if (start && end && token) {
      try {
        const result = await checkParticipantConflict(
          employee.email,
          new Date(start).toISOString(),
          new Date(end).toISOString(),
          token,
          meeting?.id || ""
        );
        if (result.hasConflict) {
          const conflictStart = new Date(result.conflictingMeetingStart).toLocaleString([], {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
          });
          setConflictWarnings(prev => ({
            ...prev,
            [employee.email]: `Already has "${result.conflictingMeetingTitle}" at ${conflictStart}`
          }));
          // Still block adding — don't add the participant
          setShowAddParticipantModal(false);
          return;
        }
      } catch (err) {
        console.error("Conflict check failed:", err);
        // Don't block on network error — let backend validate on save
      }
    }

    setEmails(prev => [...prev, employee.email]);
    setConflictWarnings(prev => {
      const next = { ...prev };
      delete next[employee.email];
      return next;
    });
    setShowAddParticipantModal(false);
  };

  /* SAVE */
  const save = async () => {
    if (!title || !start || !end) {
      alert("Fill all fields");
      return;
    }

    // Validate repeat settings when repeat is enabled
    if (repeat !== "none" && !repeatUntil && !repeatCount) {
      alert("Please set either a repeat end date or number of occurrences for repeating meetings.");
      return;
    }

    if (repeat === "weekly" && selectedDays.length === 0) {
      alert("Please select at least one weekday for weekly repeating meetings.");
      return;
    }

    // Validate that end time is after start time
    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();
    
    if (endDate <= startDate) {
      alert("End time must be after start time");
      return;
    }

    // ✅ PREVENT SCHEDULING MEETINGS IN THE PAST (only for new meetings)
    if (!meeting?.id && startDate <= now) {
      alert("Cannot schedule meetings for past dates or times. Please select a future date and time.");
      return;
    }

    // Convert datetime-local format to ISO 8601 format
    const formatDateTimeForBackend = (dateTimeLocal) => {
      if (!dateTimeLocal) return null;
      const date = new Date(dateTimeLocal);
      return date.toISOString();
    };

   const payload = {
  title,
  participantEmails: emails,
  remarks,
  startTime: formatDateTimeForBackend(start),
  endTime: formatDateTimeForBackend(end),
  status,
  repeat,
  // Convert date-only "YYYY-MM-DD" to full ISO instant for backend
  repeatUntil: repeatUntil ? new Date(repeatUntil + "T23:59:59.000Z").toISOString() : null,
  repeatCount: repeatCount ? parseInt(repeatCount) : null,
  daysOfWeek: repeat === "weekly" ? selectedDays : []
};

    try {
      const res = meeting && meeting.id
        ? await updateMeeting(meeting.id, payload, token)
        : await createMeeting(payload, token);

      onSaved(res);
    } catch (err) {
      console.error("Save error:", err);
      if (err.response?.status === 409) {
        // Conflict — show inline error, don't close the form
        const msg = err.response?.data?.message || "One or more participants have a conflicting meeting at this time.";
        alert(`⚠️ Scheduling Conflict\n\n${msg}`);
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to save meeting';
        alert(`Save failed: ${errorMessage}`);
      }
    }
  };

  /* CANCEL MEETING (UPDATE STATUS) */
  /* CANCEL MEETING (UPDATE STATUS) */
    const handleDelete = async () => {
      if (!meeting?.id) return;

      if (!window.confirm("Cancel this meeting?")) return;

      try {
        console.log('🚫 Cancelling meeting:', meeting.id);

        // Update meeting status to "Cancelled" instead of deleting
        const payload = {
          title: meeting.title,
          participantEmails: meeting.participantEmails,
          remarks: meeting.remarks, // ✅ ADD REMARKS TO CANCEL PAYLOAD
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          status: "Cancelled",
          repeat: meeting.repeat || "none"
        };

        console.log('🚫 Cancel payload:', payload);

        const updatedMeeting = await updateMeeting(meeting.id, payload, token);

        console.log('🚫 Meeting cancelled successfully:', updatedMeeting);

        // Show success message
        alert("Meeting cancelled successfully!");

        // Close the form
        onClose();

        // Trigger a refresh of the meetings list by calling onSaved with the updated meeting
        if (onSaved) {
          onSaved(updatedMeeting);
        }
      } catch (err) {
        console.error("Cancel meeting error:", err);
        alert("Failed to cancel meeting: " + (err.response?.data?.message || err.message));
      }
    };

  /* PERMANENTLY DELETE MEETING */
  const handlePermanentDelete = async () => {
    if (!meeting?.id) return;

    if (!window.confirm("Permanently delete this meeting? This action cannot be undone.")) return;

    try {
      await deleteMeeting(meeting.id, token);
      
      // Close the form
      onClose();
      
      // Trigger a refresh of the meetings list - pass a special flag to indicate deletion
      if (onSaved) {
        onSaved({ deleted: true, id: meeting.id });
      }
    } catch (err) {
      console.error("Delete meeting error:", err);
      alert("Failed to delete meeting");
    }
  };

  return (
    <div className="wc-modal-backdrop">
      <div className="wc-modal meeting-modal modern-meeting-form">

        {/* Fixed header */}
        <div className="meeting-form-header">
          <div className="header-icon">
            📅
          </div>
          <h2>{meeting && meeting.id ? "Edit Meeting" : "Schedule Meeting"}</h2>
          <p className="header-subtitle">
            {meeting && meeting.id ? "Update your meeting details" : "Create a new meeting with your team"}
          </p>
        </div>

        {/* Scrollable body */}
        <div className="meeting-form-body">

        <div className="form-section">
          <label className="form-label">
            <span className="label-icon">📝</span>
            Meeting Title
          </label>
          <input
            className="input modern-input"
            placeholder="Enter meeting title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label className="form-label">
            <span className="label-icon">👥</span>
            Add Participants
          </label>
          <div className="participants-input-wrapper">
            <button
              type="button"
              className="add-participant-btn modern-btn"
              onClick={() => setShowAddParticipantModal(true)}
            >
              <span className="btn-icon">➕</span>
              Add Participants
            </button>
          </div>

          <div className="email-chips modern-chips">
            {emails.map((e, index) => (
              <span 
                key={`${e}-${index}`} 
                className={`chip${conflictWarnings[e] ? " chip--conflict" : ""}`}
                title={conflictWarnings[e] || undefined}
                onClick={() => {
                  setEmails(emails.filter(x => x !== e));
                  setConflictWarnings(prev => {
                    const next = { ...prev };
                    delete next[e];
                    return next;
                  });
                }}
              >
                <span className="chip-text">{e}</span>
                {conflictWarnings[e] && (
                  <span className="chip-conflict-icon" title={conflictWarnings[e]}>⚠️</span>
                )}
                <span className="chip-remove">✕</span>
              </span>
            ))}
          </div>

          {/* Conflict warning banner */}
          {Object.keys(conflictWarnings).length > 0 && (
            <div className="conflict-warning-banner">
              <span className="conflict-warning-icon">⚠️</span>
              <div className="conflict-warning-list">
                {Object.entries(conflictWarnings).map(([email, msg]) => (
                  <div key={email} className="conflict-warning-row">
                    <strong>{email}</strong> — {msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <label className="form-label">
            <span className="label-icon">💬</span>
            Remarks (Optional)
          </label>
          <input
            className="input modern-input"
            placeholder="Add any notes or remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-section half">
            <label className="form-label">
              <span className="label-icon">🕐</span>
              Start Time
            </label>
            <input
              type="datetime-local"
              className="input modern-input datetime-input"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              min={!meeting?.id ? new Date().toISOString().slice(0, 16) : undefined}
            />
            
            {pastTimeError && (
              <div className="error-message past-time-error">
                <span className="error-icon">🚫</span>
                {pastTimeError}
              </div>
            )}
          </div>

          <div className="form-section half">
            <label className="form-label">
              <span className="label-icon">🕐</span>
              End Time
            </label>
            <input
              type="datetime-local"
              className="input modern-input datetime-input"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              min={!meeting?.id ? new Date().toISOString().slice(0, 16) : undefined}
            />
            
            {timeError && (
              <div className="error-message time-warning">
                <span className="error-icon">⚠️</span>
                {timeError}
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-section half">
            <label className="form-label">
              <span className="label-icon">📊</span>
              Status
            </label>
            <select
              className="input modern-input modern-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Scheduled</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="form-section half">
            <label className="form-label">
              <span className="label-icon">🔄</span>
              Repeat
            </label>
            <select
              className="input modern-input modern-select"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="customize">Customize</option>
            </select>
          </div>
        </div>

        {repeat !== "none" && (
          <div className="form-section">
            <label className="form-label">
              <span className="label-icon">📅</span>
              Repeat Settings
            </label>

            {repeat === "weekly" && (
              <div className="weekdays">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`weekday-btn ${selectedDays.includes(i) ? "active" : ""}`}
                    onClick={() => {
                      setSelectedDays(prev =>
                        prev.includes(i)
                          ? prev.filter(d => d !== i)
                          : [...prev, i]
                      );
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}

            <input
              type="date"
              className="input modern-input"
              value={repeatUntil}
              onChange={(e) => setRepeatUntil(e.target.value)}
              min={start ? start.split("T")[0] : undefined}
            />

            <div style={{ textAlign: "center", margin: "6px 0" }}>OR</div>

            <input
              type="number"
              className="input modern-input"
              placeholder="Number of occurrences"
              value={repeatCount}
              onChange={(e) => setRepeatCount(e.target.value)}
            />
          </div>
        )}

        </div>{/* end meeting-form-body */}

        {/* Fixed action bar — always visible */}
        <div className="wc-modal-actions modern-actions">
          <button className="btn modern-btn btn-secondary" onClick={onClose}>
            <span className="btn-icon">✕</span>
            Close
          </button>

          {meeting && meeting.id && (
            <>
              <button className="btn modern-btn btn-warning" onClick={handleDelete}>
                <span className="btn-icon">🚫</span>
                Cancel Meeting
              </button>
              <button className="btn modern-btn btn-danger" onClick={handlePermanentDelete}>
                <span className="btn-icon">🗑️</span>
                Delete
              </button>
            </>
          )}

          <button 
            className="btn modern-btn btn-primary" 
            onClick={save}
            disabled={!!pastTimeError}
          >
            <span className="btn-icon">💾</span>
            Save Meeting
          </button>
        </div>
      </div>

      {/* Add Participant Modal */}
      <AddParticipantModal
        isOpen={showAddParticipantModal}
        onClose={() => setShowAddParticipantModal(false)}
        onAddParticipant={handleAddParticipant}
        currentUser={currentUser}
      />
    </div>
  );
}
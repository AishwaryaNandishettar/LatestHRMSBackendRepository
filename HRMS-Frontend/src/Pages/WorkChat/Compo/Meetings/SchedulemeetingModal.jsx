import { useState, useEffect } from "react";

export default function ScheduleMeetingModal({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [emails, setEmails] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // Set default start time to current time + 1 hour, end time to start + 1 hour
  useEffect(() => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour from start
    
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    const formatForInput = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    setStart(formatForInput(startTime));
    setEnd(formatForInput(endTime));
  }, []);

 const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      alert('Please enter a meeting title');
      return;
    }
    
    if (!start) {
      alert('Please select a start time');
      return;
    }
    
    if (!end) {
      alert('Please select an end time');
      return;
    }
    
    // Check if end time is after start time
    if (new Date(end) <= new Date(start)) {
      alert('End time must be after start time');
      return;
    }

    // Convert datetime-local format to ISO 8601 format
    const formatDateTimeForBackend = (dateTimeLocal) => {
      if (!dateTimeLocal) return null;
      const date = new Date(dateTimeLocal);
      return date.toISOString().slice(0, 19);
    };

    // Parse emails (split by comma, semicolon, or space)
    const emailList = emails
      .split(/[,;\s]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const meetingData = {
      title: title.trim(),
      participantEmails: emailList,
      startTime: formatDateTimeForBackend(start),
      endTime: formatDateTimeForBackend(end),
    };

    console.log('📅 Scheduling meeting:', meetingData);
   try {
  await onSave(meetingData);
  onClose();
} catch (err) {
  console.error("❌ Meeting save failed:", err);
  alert("Failed to schedule meeting");
}
  };

  return (
    <div className="wc-modal-backdrop">
      <div className="wc-modal meeting-modal">
<h3>Schedule Meeting</h3>

<div className="form-group">
  <label>Meeting Title</label>
  <input
    placeholder="Enter Meeting title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />
</div>

<div className="form-group">
  <label>Participants</label>
  <input
    placeholder="Enter emails separated by commas"
    value={emails}
    onChange={(e) => setEmails(e.target.value)}
  />
</div>

<div className="form-group">
  <label>Start Time</label>
  <input
    type="datetime-local"
    value={start}
    onChange={(e) => setStart(e.target.value)}
  />
</div>

<div className="form-group">
  <label>End Time</label>
  <input
    type="datetime-local"
    value={end}
    onChange={(e) => setEnd(e.target.value)}
  />
</div>
        <div className="wc-modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
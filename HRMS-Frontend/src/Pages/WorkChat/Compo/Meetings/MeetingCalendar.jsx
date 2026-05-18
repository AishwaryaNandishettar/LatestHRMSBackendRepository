import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

function MeetingCalendar({ meetings, onSelect, onEdit, onJoin }) {
  const now = new Date();

  // ✅ Generate recurring event instances (FIXED)
const generateRecurringInstances = (meeting) => {
  const instances = [];
  const startDate = new Date(meeting.startTime);
  const endDate = new Date(meeting.endTime);
  const isCancelled = meeting.status === "Cancelled";

  let currentDate = new Date(startDate);
  let count = 0;
  const maxInstances = 365;

  // If repeat is enabled but no valid end condition is present, do not generate an endless series.
  if (!meeting.repeatUntil && !meeting.repeatCount) {
    const instanceStart = new Date(startDate);
    const instanceEnd = new Date(endDate);

    return [
      {
        id: `${meeting.id}-${instanceStart.getTime()}`,
        title: meeting.title,
        start: instanceStart,
        end: instanceEnd,
        allDay: false,
        display: "block",
        color: isCancelled ? "#dc2626" : "#4f46e5",
        classNames: isCancelled ? ["cancelled-meeting"] : [],
        extendedProps: {
          status: meeting.status,
          originalMeeting: meeting,
        },
      },
    ];
  }

  while (count < maxInstances) {
    if (meeting.repeatUntil) {
      const until = new Date(meeting.repeatUntil);
      if (currentDate > until) break;
    }

    if (meeting.repeatCount) {
      if (count >= meeting.repeatCount) break;
    }

    const instanceStart = new Date(currentDate);
    const instanceEnd = new Date(currentDate);
    instanceEnd.setHours(endDate.getHours(), endDate.getMinutes(), endDate.getSeconds(), endDate.getMilliseconds());

    instances.push({
      id: `${meeting.id}-${currentDate.getTime()}`,
      title: meeting.title,
      start: instanceStart,
      end: instanceEnd,
      allDay: false,
      display: "block",
      color: isCancelled ? "#dc2626" : "#4f46e5",
      classNames: isCancelled ? ["cancelled-meeting"] : [],
      extendedProps: {
        status: meeting.status,
        originalMeeting: meeting,
      },
    });

    count++;

    if (meeting.repeat === "daily") {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (meeting.repeat === "weekly") {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (meeting.repeat === "monthly") {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      break;
    }
  }

  return instances;
};

  // ✅ Generate all events
  const events = meetings.flatMap((m) => {
    if (m.repeat && m.repeat !== "none") {
      return generateRecurringInstances(m);
    } else {
      const meetingEndTime = new Date(m.endTime);
      const isPastMeeting = meetingEndTime < now;

      return [
        {
          id: m.id,
          title: m.title,
          start: m.startTime,
          end: m.endTime,

          allDay: false,
          display: "block", // ✅ IMPORTANT

          color: m.status === "Cancelled" ? "#dc2626" : isPastMeeting ? "#9ca3af" : "#4f46e5",

          classNames:
            m.status === "Cancelled" ? ["cancelled-meeting"] : [],

          extendedProps: {
            status: m.status,
            originalId: m.id,
            originalMeeting: m,
          },
        },
      ];
    }
  });

  const calendarStyles = `
    .fc-daygrid-event {
      margin-bottom: 3px !important;
      font-size: 12px !important;
      border-radius: 4px !important;
      padding: 2px 4px !important;
    }

    .fc-daygrid-event-dot {
      display: none !important;
    }

    .fc-event-title {
      font-weight: 500 !important;
    }

    /* Cancelled meetings */
    .cancelled-meeting {
      opacity: 0.9 !important;
      color: #991b1b !important;
      background-color: rgba(254, 226, 226, 0.95) !important;
      border: 1px solid #f87171 !important;
      text-decoration: line-through solid #dc2626 !important;
    }
  `;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: calendarStyles }} />

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}

        initialView="dayGridMonth"
        height="100%"

        events={events}

        // ✅ CRITICAL FIXES
        dayMaxEvents={true}
        eventDisplay="block"
        eventOverlap={false}

        // Time formatting
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}

        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}

        dateClick={(info) => {
          onSelect && onSelect(new Date(info.date));
        }}

        eventClick={(info) => {
          const originalMeeting = info.event.extendedProps.originalMeeting;
          if (!originalMeeting) return;

          if (originalMeeting.status === "Cancelled") {
            onEdit && onEdit(originalMeeting);
            return;
          }

          const now = new Date();
          const meetingStartTime = new Date(originalMeeting.startTime);
          const meetingEndTime = new Date(originalMeeting.endTime);
          const canJoinTime = new Date(meetingStartTime.getTime() - 15 * 60 * 1000);

          // Show options: Join or Edit
          const canJoin = now >= canJoinTime && now <= meetingEndTime;
          const canEdit = now < meetingEndTime;

          if (canJoin && canEdit) {
            const action = window.confirm(
              `Meeting: ${originalMeeting.title}\n\nClick OK to JOIN the meeting\nClick Cancel to EDIT the meeting`
            );
            if (action) {
              onJoin && onJoin(originalMeeting);
            } else {
              onEdit && onEdit(originalMeeting);
            }
          } else if (canJoin) {
            onJoin && onJoin(originalMeeting);
          } else if (canEdit) {
            onEdit && onEdit(originalMeeting);
          } else {
            alert("This meeting has already ended.");
          }
        }}

        eventDidMount={(info) => {
          if (info.event.extendedProps.status === "Cancelled") {
            info.el.classList.add("cancelled-meeting");
          }
        }}
      />
    </div>
  );
}

export default MeetingCalendar;
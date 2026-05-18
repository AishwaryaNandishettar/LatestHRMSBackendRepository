import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById } from "../api/homeApi";
import { FaArrowLeft, FaCalendarAlt, FaTag, FaUser } from "react-icons/fa";
import "./EventDetail.css";

const TYPE_COLORS = {
  HR: "#4f46e5",
  Meeting: "#16a34a",
  Holiday: "#dc2626",
  Payroll: "#f59e0b",
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getEventById(id)
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Event not found.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="event-detail-page">
        <div className="event-detail-loading">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <div className="event-detail-error">
          <p>{error || "Event not found."}</p>
          <button className="back-btn" onClick={() => navigate("/home")}>
            <FaArrowLeft /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  const accentColor = TYPE_COLORS[event.type] || "#3b82f6";

  return (
    <div className="event-detail-page">
      <div className="event-detail-card">
        {/* Header strip */}
        <div className="event-detail-header" style={{ borderLeft: `6px solid ${accentColor}` }}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
          <span
            className="event-type-badge"
            style={{ backgroundColor: accentColor }}
          >
            {event.type || "Event"}
          </span>
        </div>

        {/* Title */}
        <h1 className="event-detail-title">{event.title}</h1>

        {/* Meta info */}
        <div className="event-detail-meta">
          <div className="meta-item">
            <FaCalendarAlt className="meta-icon" />
            <span>
              {event.date
                ? new Date(event.date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Date not set"}
            </span>
          </div>
          <div className="meta-item">
            <FaTag className="meta-icon" />
            <span>{event.type || "General"}</span>
          </div>
          {event.createdBy && (
            <div className="meta-item">
              <FaUser className="meta-icon" />
              <span>Created by: {event.createdBy}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <hr className="event-detail-divider" />

        {/* Description */}
        <div className="event-detail-description">
          <h3>Description</h3>
          <p>
            {event.description
              ? event.description
              : "No additional details provided for this event."}
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import {
  FaSearch, FaUsers, FaCalendarPlus, FaPhone, FaVideo,
  FaPhoneSlash, FaSpinner, FaWifi, FaExclamationTriangle,
  FaEnvelope, FaBriefcase, FaBuilding, FaMapMarkerAlt,
  FaCalendarAlt, FaIdBadge, FaTimes
} from "react-icons/fa";

export default function ChatHeader({
  user,
  search,
  onSearch,
  onToggleMembers,
  onOpenCalendar,
  onStartVoiceCall,
  onStartVideoCall,
  callState = 'idle',
  wsConnected = true
}) {
  const [showProfile, setShowProfile] = useState(false);
  const cardRef = useRef(null);

  // Close card when clicking outside
  useEffect(() => {
    if (!showProfile) return;
    const handler = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showProfile]);

  const getCallButtonState = () => {
    switch (callState) {
      case 'calling':
        return { disabled: true, icon: FaSpinner, title: 'Calling...', className: 'calling' };
      case 'ringing':
        return { disabled: true, icon: FaSpinner, title: 'Ringing...', className: 'ringing' };
      case 'connected':
        return { disabled: true, icon: FaPhoneSlash, title: 'In call', className: 'connected' };
      default:
        return { disabled: false, icon: null, title: '', className: '' };
    }
  };

  const callButtonState = getCallButtonState();
  const isCallActive = callState !== 'idle';
  const isGroup = user?.type === "GROUP";

  // For groups, show member count in subtitle
  const memberCount = isGroup ? (user?.memberEmails?.length || 0) : 0;

  const subtitle = isGroup
    ? `Group · ${memberCount} member${memberCount !== 1 ? 's' : ''}`
    : callState === 'calling' ? 'Calling...'
    : callState === 'ringing' ? 'Ringing...'
    : callState === 'connected' ? 'In call'
    : 'Direct message';

  return (
    <div className="wc-header">
      <div className="wc-header-left">
        {/* Avatar — clickable for profile card (DM only) */}
        <div
          className={`wc-avatar${isGroup ? " wc-avatar--group" : ""}`}
          style={!isGroup ? { cursor: "pointer" } : {}}
          onClick={() => !isGroup && setShowProfile(v => !v)}
          title={!isGroup ? "View profile" : undefined}
        >
          {isGroup ? <FaUsers /> : (user?.name?.charAt(0).toUpperCase() || "?")}
        </div>

        <div style={{ position: "relative" }}>
          <div
            className="wc-header-title"
            style={!isGroup ? { cursor: "pointer" } : {}}
            onClick={() => !isGroup && setShowProfile(v => !v)}
          >
            {user?.name}
            {/* WebSocket status */}
            <span
              className={`ws-status ${wsConnected ? 'connected' : 'disconnected'}`}
              title={wsConnected ? 'Connected' : 'Connection lost — calls may not work'}
            >
              {wsConnected ? <FaWifi /> : <FaExclamationTriangle />}
            </span>
          </div>
          <div className="wc-header-sub">{subtitle}</div>

          {/* ── Profile card popup ── */}
          {showProfile && !isGroup && (
            <div className="wc-profile-card" ref={cardRef}>
              <button
                className="wc-profile-card__close"
                onClick={() => setShowProfile(false)}
                title="Close"
              >
                <FaTimes />
              </button>

              {/* Avatar + name */}
              <div className="wc-profile-card__hero">
                <div className="wc-profile-card__avatar">
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <div className="wc-profile-card__name">{user?.name}</div>
                  {user?.designation && (
                    <div className="wc-profile-card__designation">{user.designation}</div>
                  )}
                </div>
              </div>

              <div className="wc-profile-card__divider" />

              {/* Details */}
              <div className="wc-profile-card__details">
                {user?.email && (
                  <div className="wc-profile-card__row">
                    <FaEnvelope className="wc-profile-card__icon" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user?.role && (
                  <div className="wc-profile-card__row">
                    <FaIdBadge className="wc-profile-card__icon" />
                    <span>{user.role}</span>
                  </div>
                )}
                {user?.department && (
                  <div className="wc-profile-card__row">
                    <FaBuilding className="wc-profile-card__icon" />
                    <span>{user.department}</span>
                  </div>
                )}
                {user?.phone && (
                  <div className="wc-profile-card__row">
                    <FaPhone className="wc-profile-card__icon" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user?.location && (
                  <div className="wc-profile-card__row">
                    <FaMapMarkerAlt className="wc-profile-card__icon" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user?.joiningDate && (
                  <div className="wc-profile-card__row">
                    <FaCalendarAlt className="wc-profile-card__icon" />
                    <span>Joined {user.joiningDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="wc-header-right">
        {/* Search */}
        <div className="wc-msg-search">
          <FaSearch />
          <input
            placeholder="Search messages"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Voice call */}
        <button
          title={callButtonState.title || (isGroup ? "Group voice call" : "Voice call")}
          onClick={onStartVoiceCall}
          disabled={callButtonState.disabled}
          className={`call-btn voice-call ${callButtonState.className}`}
        >
          {callButtonState.icon
            ? <callButtonState.icon className="spinning" />
            : <FaPhone />}
        </button>

        {/* Video call */}
        <button
          title={callButtonState.title || (isGroup ? "Group video call" : "Video call")}
          onClick={onStartVideoCall}
          disabled={callButtonState.disabled}
          className={`call-btn video-call ${callButtonState.className}`}
        >
          {callButtonState.icon
            ? <callButtonState.icon className="spinning" />
            : <FaVideo />}
        </button>

        {/* Calendar */}
        <button title="Meetings" onClick={onOpenCalendar} disabled={isCallActive}>
          <FaCalendarPlus />
        </button>

        {/* Group members panel toggle */}
        {isGroup && (
          <button title="Group members" onClick={onToggleMembers} disabled={isCallActive}>
            <FaUsers />
          </button>
        )}
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import {
  FaPlus,
  FaCog,
  FaBell,
  FaCalendarAlt,
  FaSearch,
  FaThumbtack
} from "react-icons/fa";

import "./ChatSidebar.css";

/* =========================
   AVATAR HELPERS
========================= */

const getInitials = (name) => {
  if (!name) return "??";

  const words = name.trim().split(" ").filter(Boolean);

  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();

  return (words[0][0] + words[1][0]).toUpperCase();
};

const getAvatarColor = (text) => {
  if (!text) return "#6b7280";

  const colors = [
    "#2563eb",
    "#7c3aed",
    "#059669",
    "#ea580c",
    "#db2777",
    "#0ea5e9",
    "#16a34a",
    "#9333ea",
    "#f59e0b",
  ];

  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/* =========================
   TIME FORMAT
========================= */

const formatTime = (time) => {
  if (!time) return "";
  const date = new Date(time);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function ChatSidebar({
  users = [],
  groups = [],
  activities = [],
  selectedChat,
  onSelectUser,
  onSelectGroup,
  onCreateGroup,
  messageCount = 0,
  groupCount = 0,
  unreadPerUser = {},
  unreadPerGroup = {},
}) {

  const [search, setSearch] = useState("");

  /* =========================
     SEPARATE USERS AND GROUPS
  ========================= */

  const userChats = useMemo(() => {
    return users.map((u) => ({
      ...u,
      type: "USER",
      id: u.email,
      name: u.name,
      pinned: u.pinned || false
    }));
  }, [users]);

  const groupChats = useMemo(() => {
    return groups.map((g) => ({
      ...g,
      type: "GROUP",
      id: g.id,
      name: g.name,
      pinned: g.pinned || false
    }));
  }, [groups]);

  /* =========================
     SEARCH FILTER
  ========================= */

  const filteredUsers = userChats.filter((chat) =>
    chat?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGroups = groupChats.filter((chat) =>
    chat?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const pinnedUsers = filteredUsers.filter((c) => c.pinned);
  const normalUsers = filteredUsers.filter((c) => !c.pinned);

  const pinnedGroups = filteredGroups.filter((c) => c.pinned);
  const normalGroups = filteredGroups.filter((c) => !c.pinned);

  /* =========================
     SELECT CHAT
  ========================= */

  const handleSelect = (chat) => {
    if (chat.type === "USER") {
      onSelectUser(chat);
    } else {
      onSelectGroup(chat);
    }
  };

  return (
    <div className="chat-sidebar">

      {/* HEADER */}
      <div className="sidebar-header">
        <span>Work Chat</span>
        <FaPlus title="Create Group" onClick={onCreateGroup} />
      </div>

      {/* SEARCH */}
      <div className="sidebar-search">
        <FaSearch />
        <input
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ACTIVITY */}
      <div className="sidebar-label">Activity</div>

      {activities.map((activity, index) => (
        <div key={index} className="activity-item">

          <div className="activity-text">
            {activity.icon === "meeting" && <FaCalendarAlt />}
            {activity.icon === "notification" && <FaBell />}
            {activity.text}
          </div>

          <div className="activity-time">{activity.time}</div>

        </div>
      ))}

      {/* PINNED USERS */}
      {pinnedUsers.length > 0 && (
        <>
          <div className="sidebar-label">Pinned</div>
          {pinnedUsers.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              selectedChat={selectedChat}
              onClick={handleSelect}
              unreadCount={unreadPerUser[chat.email?.toLowerCase()] || 0}
            />
          ))}
        </>
      )}

      {/* ALL CHATS (1-to-1 only) */}
      <div className="sidebar-label">
        Chats {messageCount > 0 && <span className="sidebar-label-count">({messageCount})</span>}
      </div>

      <div className="chat-list">
        {normalUsers.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            selectedChat={selectedChat}
            onClick={handleSelect}
            unreadCount={unreadPerUser[chat.email?.toLowerCase()] || 0}
          />
        ))}
      </div>

      {/* PINNED GROUPS */}
      {pinnedGroups.length > 0 && (
        <>
          <div className="sidebar-label">Pinned Groups</div>
          {pinnedGroups.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              selectedChat={selectedChat}
              onClick={handleSelect}
              unreadCount={unreadPerGroup[chat.id] || 0}
            />
          ))}
        </>
      )}

      {/* ALL GROUPS */}
      <div className="sidebar-label">
        Groups {groupCount > 0 && <span className="sidebar-label-count">({groupCount})</span>}
      </div>

      <div className="chat-list">
        {normalGroups.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            selectedChat={selectedChat}
            onClick={handleSelect}
            unreadCount={unreadPerGroup[chat.id] || chat.unread || 0}
          />
        ))}
      </div>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <FaCog title="Settings" />
      </div>

    </div>
  );
}

/* =========================
   CHAT ITEM — Teams-style
========================= */

function ChatItem({ chat, selectedChat, onClick, unreadCount = 0 }) {
  const isActive =
    selectedChat?.type === chat.type &&
    selectedChat?.id === chat.id;

  const hasUnread = unreadCount > 0;

  return (
    <div
      className={`chat-user${isActive ? " active" : ""}${hasUnread ? " has-unread" : ""}`}
      onClick={() => onClick(chat)}
    >
      {/* AVATAR */}
      <div className="avatar" style={{ background: getAvatarColor(chat.name) }}>
        {getInitials(chat.name)}
        {/* Online dot for 1-on-1 chats */}
        {chat.type === "USER" && (
          <span className={`status-dot ${chat.online ? "online" : "offline"}`} />
        )}
        {/* Blue unread dot (Teams-style) — shown when there are unread messages */}
        {hasUnread && !isActive && (
          <span className="unread-dot" aria-hidden="true" />
        )}
      </div>

      {/* CHAT INFO */}
      <div className="info">
        <div className="top-row">
          {/* Name — bold when unread */}
          <div className={`name${hasUnread && !isActive ? " name--unread" : ""}`}>
            {chat.name}
          </div>
          <div className="meta">
            {chat.pinned && <FaThumbtack className="pin-icon" />}
            <span className={`time${hasUnread && !isActive ? " time--unread" : ""}`}>
              {formatTime(chat.lastMessageTime)}
            </span>
          </div>
        </div>

        {/* Last message preview — bold when unread */}
        <div className={`message-preview${hasUnread && !isActive ? " message-preview--unread" : ""}`}>
          {chat.lastMessage || "No messages yet"}
        </div>
      </div>

      {/* Unread count badge — red pill (Teams-style) */}
      {hasUnread && !isActive && (
        <div className="unread-badge" aria-label={`${unreadCount} unread messages`}>
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </div>
  );
}
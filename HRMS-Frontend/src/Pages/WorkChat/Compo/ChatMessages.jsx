import { useEffect, useRef, useState } from "react";
import {
  FaFile, FaImage, FaFilePdf, FaFileWord, FaFileExcel,
  FaFilePowerpoint, FaFileArchive, FaFileCode, FaFileAlt,
  FaDownload, FaExternalLinkAlt
} from "react-icons/fa";

// ── File type helpers ─────────────────────────────────────────────────────────
const getFileIcon = (fileType, fileName) => {
  const type = fileType || "";
  const name = (fileName || "").toLowerCase();

  if (type.startsWith("image/"))                                         return { icon: FaImage,         color: "#10b981", label: "Image" };
  if (type === "application/pdf" || name.endsWith(".pdf"))               return { icon: FaFilePdf,        color: "#ef4444", label: "PDF" };
  if (name.endsWith(".doc") || name.endsWith(".docx"))                   return { icon: FaFileWord,       color: "#2563eb", label: "Word" };
  if (name.endsWith(".xls") || name.endsWith(".xlsx"))                   return { icon: FaFileExcel,      color: "#16a34a", label: "Excel" };
  if (name.endsWith(".ppt") || name.endsWith(".pptx"))                   return { icon: FaFilePowerpoint, color: "#ea580c", label: "PowerPoint" };
  if (name.endsWith(".zip") || name.endsWith(".rar") || name.endsWith(".7z")) return { icon: FaFileArchive, color: "#7c3aed", label: "Archive" };
  if (name.endsWith(".js") || name.endsWith(".ts") || name.endsWith(".jsx") ||
      name.endsWith(".tsx") || name.endsWith(".py") || name.endsWith(".java") ||
      name.endsWith(".html") || name.endsWith(".css") || name.endsWith(".json")) return { icon: FaFileCode, color: "#0891b2", label: "Code" };
  if (name.endsWith(".txt") || name.endsWith(".md"))                     return { icon: FaFileAlt,        color: "#6b7280", label: "Text" };
  return { icon: FaFile, color: "#6b7280", label: "File" };
};

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── File attachment card ──────────────────────────────────────────────────────
function FileCard({ fileUrl, fileName, fileType, fileSize, isMe }) {
  const { icon: Icon, color, label } = getFileIcon(fileType, fileName);
  const isImage = fileType?.startsWith("image/");

  if (isImage) {
    return (
      <div className="msg-image-wrap">
        <img
          src={fileUrl}
          alt={fileName || "image"}
          className="msg-image"
          onClick={() => window.open(fileUrl, "_blank")}
          title="Click to open"
        />
        <div className="msg-image-overlay">
          <FaExternalLinkAlt />
        </div>
      </div>
    );
  }

  return (
    <a
      href={fileUrl}
      download={fileName}
      target="_blank"
      rel="noopener noreferrer"
      className={`msg-file-card${isMe ? " msg-file-card--me" : ""}`}
    >
      <div className="msg-file-icon" style={{ background: `${color}18`, color }}>
        <Icon />
      </div>
      <div className="msg-file-info">
        <span className="msg-file-name" title={fileName}>
          {fileName && fileName.length > 30 ? fileName.substring(0, 28) + "…" : fileName}
        </span>
        <span className="msg-file-meta">
          {label}{fileSize ? ` · ${formatBytes(fileSize)}` : ""}
        </span>
      </div>
      <div className="msg-file-download">
        <FaDownload />
      </div>
    </a>
  );
}

export default function ChatMessages({
  messages = [],
  loggedInEmail,
  onDelete,
  onEdit,
  onReply,
  onForward
}) {
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [menu, setMenu] = useState(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const prevMessagesLengthRef = useRef(messages.length);
  const prevMessagesRef = useRef(messages);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Track whether user is near the bottom (within 150px)
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    setIsNearBottom(scrollHeight - scrollTop - clientHeight < 150);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    const prevMessages = prevMessagesRef.current;
    const newMessageAdded = messages.length > prevMessagesLengthRef.current;

    if (newMessageAdded) {
      const lastMsg = messages[messages.length - 1];
      const isMySentMessage = lastMsg?.senderEmail?.toLowerCase() === loggedInEmail?.toLowerCase();

      // Scroll to bottom only if:
      // 1. User sent the message themselves, OR
      // 2. User is already near the bottom (like Teams)
      if (isMySentMessage || isNearBottom) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } else if (messages.length !== prevMessages.length) {
      // Chat switched (full reload) — jump to bottom instantly
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }

    prevMessagesLengthRef.current = messages.length;
    prevMessagesRef.current = messages;
  }, [messages, isNearBottom, loggedInEmail]);

  const closeMenu = () => setMenu(null);

  return (
    <div
      className="wc-messages"
      ref={messagesContainerRef}
      onClick={closeMenu}
      onScroll={handleScroll}
    >
      {messages.map((m, i) => {
        const isMe = m?.senderEmail?.toLowerCase() === loggedInEmail?.toLowerCase();
        const msgTime = m?.timestamp || m?.createdAt;
        const currentDate = msgTime ? new Date(msgTime).toDateString() : "";
        const prevMsg = messages[i - 1];
        const prevTime = prevMsg?.timestamp || prevMsg?.createdAt;
        const prevDate = prevTime ? new Date(prevTime).toDateString() : "";
        const showDate = currentDate !== prevDate;

        const fileUrl = m?.fileUrl
          ? m.fileUrl.startsWith("blob:") ? m.fileUrl
          : m.fileUrl.startsWith("http")  ? m.fileUrl
          : `${BASE_URL}${m.fileUrl}`
          : null;

        // Show sender name only when the sender changes (Teams-style grouping)
        const prevSenderEmail = prevMsg?.senderEmail;
        const showSenderName = !isMe && (showDate || prevSenderEmail?.toLowerCase() !== m.senderEmail?.toLowerCase());

        return (
          <div key={m.id || `${i}-${msgTime}`}>
            {/* Date separator */}
            {showDate && (
              <div className="msg-date-sep">
                <span>{currentDate}</span>
              </div>
            )}

            <div className={`wc-message ${isMe ? "me" : "them"}`}>
              <div
                className={`msg-bubble${isMe ? " msg-bubble--me" : " msg-bubble--them"}`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({ x: e.pageX, y: e.pageY, message: m });
                }}
              >
                {/* Sender name — only shown when sender changes, like Teams */}
                {showSenderName && (
                  <div className="msg-sender-name">
                    {m.senderName || m.senderEmail?.split("@")[0]}
                  </div>
                )}

                {/* Forwarded label */}
                {m.isForwarded && (
                  <div className="msg-forwarded-label">↗️ Forwarded</div>
                )}

                {/* Deleted message */}
                {m.deleted && !m.fileUrl ? (
                  <i className="msg-deleted">This message was deleted</i>
                ) : (
                  <>
                    {/* Reply quote block */}
                    {(m.replyTo || m.replyPreview) && (
                      <div className="msg-reply-quote">
                        <div className="msg-reply-quote-sender">
                          ↩ {
                            m.replyTo?.senderName ||
                            (m.replyTo?.senderEmail
                              ? m.replyTo.senderEmail.split("@")[0]
                              : "Unknown")
                          }
                        </div>
                        <div className="msg-reply-quote-text">
                          {(m.replyTo?.content || m.replyPreview || "").substring(0, 80)}
                          {(m.replyTo?.content || m.replyPreview || "").length > 80 ? "…" : ""}
                        </div>
                      </div>
                    )}

                    {/* Message text */}
                    {m.content && (
                      <div className="msg-text">{m.content}</div>
                    )}

                    {/* Edited indicator */}
                    {m.edited && (
                      <span className="msg-edited">(edited)</span>
                    )}
                  </>
                )}

                {/* File attachment */}
                {fileUrl && (
                  <FileCard
                    fileUrl={fileUrl}
                    fileName={m.fileName}
                    fileType={m.fileType}
                    fileSize={m.fileSize}
                    isMe={isMe}
                  />
                )}

                {/* Timestamp */}
                <div className="msg-time">
                  {msgTime && new Date(msgTime).toLocaleTimeString([], {
                    hour: "2-digit", minute: "2-digit"
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Context menu */}
      {menu && (
        <div
          className="msg-context-menu"
          style={{
            top:  Math.min(menu.y, window.innerHeight - 280),
            left: Math.min(menu.x, window.innerWidth  - 180),
          }}
        >
          <button onClick={() => { navigator.clipboard.writeText(menu.message.content || ""); closeMenu(); }}>
            📋 Copy
          </button>
          <button onClick={() => { onReply(menu.message); closeMenu(); }}>
            💬 Reply
          </button>
          <button onClick={() => { onForward(menu.message); closeMenu(); }}>
            ↗️ Forward
          </button>
          {menu.message.senderEmail?.toLowerCase() === loggedInEmail?.toLowerCase() && (
            <button onClick={() => { onEdit(menu.message); closeMenu(); }}>
              ✏️ Edit
            </button>
          )}
          <button className="msg-context-delete" onClick={() => { onDelete(menu.message); closeMenu(); }}>
            🗑 Delete
          </button>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

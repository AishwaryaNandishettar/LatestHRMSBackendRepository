import { useState, useRef } from "react";
import { FaPaperPlane, FaSmile, FaPaperclip, FaTimes, FaFile, FaImage, FaFilePdf, FaFileWord, FaFileExcel } from "react-icons/fa";
import EmojiPicker from "./EmojiPicker";

// ── File size limits (matching backend application.properties) ────────────────
const MAX_FILE_SIZE_MB  = 100;          // per file
const MAX_TOTAL_SIZE_MB = 200;          // all files combined
const MAX_FILE_SIZE_BYTES  = MAX_FILE_SIZE_MB  * 1024 * 1024;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;
const MAX_FILES = 10;                   // max files per message

// ── Format bytes to human-readable ───────────────────────────────────────────
const formatBytes = (bytes) => {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── Get file icon by type ─────────────────────────────────────────────────────
const getFileIcon = (file) => {
  const type = file.type || "";
  const name = file.name?.toLowerCase() || "";
  if (type.startsWith("image/"))                                    return <FaImage style={{ color: "#10b981" }} />;
  if (type === "application/pdf" || name.endsWith(".pdf"))          return <FaFilePdf style={{ color: "#ef4444" }} />;
  if (name.endsWith(".doc") || name.endsWith(".docx"))              return <FaFileWord style={{ color: "#2563eb" }} />;
  if (name.endsWith(".xls") || name.endsWith(".xlsx"))              return <FaFileExcel style={{ color: "#16a34a" }} />;
  return <FaFile style={{ color: "#6b7280" }} />;
};

export default function ChatComposer({ onSend, replyMessage, setReplyMessage }) {
  const [text, setText]         = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [files, setFiles]       = useState([]);
  const [fileError, setFileError] = useState(null);
  const fileInputRef            = useRef(null);

  // ── Validate and add files ──────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;

    const errors = [];
    const valid  = [];

    // Check total count
    if (files.length + selected.length > MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} files per message.`);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileError(errors.join(" "));
      return;
    }

    for (const f of selected) {
      if (f.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`"${f.name}" exceeds the ${MAX_FILE_SIZE_MB} MB per-file limit (${formatBytes(f.size)}).`);
      } else {
        valid.push(f);
      }
    }

    // Check combined size
    const existingTotal = files.reduce((sum, f) => sum + f.size, 0);
    const newTotal      = valid.reduce((sum, f) => sum + f.size, 0);
    if (existingTotal + newTotal > MAX_TOTAL_SIZE_BYTES) {
      errors.push(`Total size exceeds the ${MAX_TOTAL_SIZE_MB} MB limit.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileError(errors.join(" "));
      return;
    }

    if (errors.length) {
      setFileError(errors.join(" "));
    } else {
      setFileError(null);
    }

    if (valid.length) {
      setFiles(prev => [...prev, ...valid]);
    }

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFileError(null);
  };

  // ── Send ────────────────────────────────────────────────────────────────────
  const send = () => {
    if (!text.trim() && files.length === 0) return;
    if (fileError) return;

    onSend(text, files, replyMessage);

    setText("");
    setFiles([]);
    setEmojiOpen(false);
    setReplyMessage(null);
    setFileError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="wc-composer">

      {/* ── Reply preview ──────────────────────────────────────────────────── */}
      {replyMessage && (
        <div className="wc-reply-preview">
          <div className="wc-reply-preview-content">
            <div className="wc-reply-preview-sender">
              ↩ {replyMessage.senderName || replyMessage.senderEmail?.split("@")[0] || "Unknown"}
            </div>
            <div className="wc-reply-preview-text">
              {replyMessage.content?.substring(0, 80)}
              {(replyMessage.content?.length || 0) > 80 ? "…" : ""}
            </div>
          </div>
          <button
            className="wc-reply-close"
            onClick={() => setReplyMessage(null)}
            title="Cancel reply"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* ── File error ─────────────────────────────────────────────────────── */}
      {fileError && (
        <div className="wc-file-error">
          ⚠️ {fileError}
          <button onClick={() => setFileError(null)}><FaTimes /></button>
        </div>
      )}

      {/* ── File previews ──────────────────────────────────────────────────── */}
      {files.length > 0 && (
        <div className="wc-file-preview-list">
          {files.map((f, i) => (
            <div key={i} className="wc-file-chip">
              <span className="wc-file-chip-icon">{getFileIcon(f)}</span>
              <span className="wc-file-chip-name" title={f.name}>
                {f.name.length > 20 ? f.name.substring(0, 18) + "…" : f.name}
              </span>
              <span className="wc-file-chip-size">{formatBytes(f.size)}</span>
              <button
                className="wc-file-chip-remove"
                onClick={() => removeFile(i)}
                title="Remove file"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Composer row ───────────────────────────────────────────────────── */}
      <div className="wc-composer-row">
        {/* Emoji */}
        <button
          className="wc-icon-btn"
          onClick={() => setEmojiOpen(!emojiOpen)}
          title="Emoji"
        >
          <FaSmile />
        </button>

        {/* File attach */}
        <label className="wc-icon-btn" title={`Attach files (max ${MAX_FILE_SIZE_MB} MB each)`}>
          <FaPaperclip />
          <input
            ref={fileInputRef}
            type="file"
            hidden
            multiple
            onChange={handleFileChange}
          />
        </label>

        {/* Text input */}
        <div className="wc-input-wrap">
          <textarea
            className="wc-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            onKeyDown={handleKeyDown}
            rows={1}
          />

          <EmojiPicker
            visible={emojiOpen}
            onSelect={(emoji) => setText((prev) => prev + emoji)}
          />
        </div>

        {/* Send */}
        <button
          className="wc-send-btn"
          onClick={send}
          disabled={!text.trim() && files.length === 0}
          title="Send"
        >
          <FaPaperPlane />
        </button>
      </div>

      {/* ── File size info hint ─────────────────────────────────────────────── */}
      {files.length > 0 && (
        <div className="wc-file-size-hint">
          {files.length} file{files.length > 1 ? "s" : ""} · {formatBytes(files.reduce((s, f) => s + f.size, 0))} / {MAX_TOTAL_SIZE_MB} MB max
        </div>
      )}
    </div>
  );
}

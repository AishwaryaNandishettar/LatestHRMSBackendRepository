import { useState } from "react";
import { createGroup } from "../../../api/GroupChatApi";

export default function CreateGroupModal({
  users = [],
  token,
  onCreated,
  onClose,
}) {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggle = (email) => {
    setMembers((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  const create = async () => {
    if (!groupName.trim()) return alert("Group name required");
    if (members.length === 0) return alert("Select at least one member");

    try {
      setLoading(true);
      const group = await createGroup({ groupName, members }, token);
      onCreated(group);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cg-backdrop" onClick={onClose}>
      <div className="cg-modal" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="cg-header">
          <h3>Create Group</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {/* GROUP NAME */}
        <div className="cg-input">
          <input
            placeholder="Enter group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        {/* SELECTED MEMBERS (CHIPS) */}
        {members.length > 0 && (
          <div className="cg-chips">
            {members.map((m) => (
              <span key={m} onClick={() => toggle(m)}>
                {m.split("@")[0]} ✕
              </span>
            ))}
          </div>
        )}

        {/* USERS LIST */}
        <div className="cg-users">
          {users.length === 0 && <p>No users available</p>}

          {users.map((u) => (
            <div
              key={u.email}
              className={`cg-user ${members.includes(u.email) ? "selected" : ""}`}
              onClick={() => toggle(u.email)}
            >
              <div className="cg-avatar">
                {u.name?.charAt(0).toUpperCase()}
              </div>

              <div className="cg-info">
                <div>{u.name}</div>
                <small>{u.email}</small>
              </div>

              {members.includes(u.email) && <div className="cg-check">✓</div>}
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="cg-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={create} disabled={loading}>
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>

      </div>
    </div>
  );
}
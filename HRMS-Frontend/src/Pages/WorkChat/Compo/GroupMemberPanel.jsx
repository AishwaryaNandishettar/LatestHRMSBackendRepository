import { useState, useEffect, useContext } from "react";
import { FaTimes, FaSearch, FaUserPlus, FaSignOutAlt, FaEdit, FaCheck, FaCrown, FaTrash } from "react-icons/fa";
import { AuthContext } from "../../../Context/Authcontext";
import { addGroupMembers, removeGroupMember, leaveGroup, updateGroupName } from "../../../api/GroupChatApi";
import { fetchChatUsers } from "../../../api/chatUsersApi";
import "./GroupMemberPanel.css";

/**
 * Teams-style Group Members Panel
 * Features: view members, add members (admin), remove members (admin),
 *           leave group (any member), rename group (admin)
 */
export default function GroupMembersPanel({ group, onClose, onGroupUpdated, onGroupLeft }) {
  const { user, token } = useContext(AuthContext);
  const loggedInEmail = user?.email?.trim().toLowerCase() || "";
  const isAdmin = group?.adminEmail?.toLowerCase() === loggedInEmail;

  // ── State ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState("members"); // "members" | "add"
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(group?.name || "");
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null); // email to remove

  // ── Load all users for add-member search ───────────────────────────────────
  useEffect(() => {
    if (tab === "add" && token) {
      fetchChatUsers(token)
        .then(users => setAllUsers(users.filter(u => u.email !== loggedInEmail)))
        .catch(() => setError("Failed to load users"));
    }
  }, [tab, token, loggedInEmail]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  const memberEmails = group?.memberEmails || [];

  // Users not already in the group
  const nonMembers = allUsers.filter(
    u => !memberEmails.map(e => e.toLowerCase()).includes(u.email?.toLowerCase())
  );

  const filteredNonMembers = nonMembers.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = memberEmails.filter(email =>
    email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleAddMembers = async () => {
    if (selectedToAdd.length === 0) return;
    setLoading(true);
    try {
      const updated = await addGroupMembers(group.id, selectedToAdd, token);
      onGroupUpdated?.(updated);
      setSelectedToAdd([]);
      setTab("members");
      showSuccess(`Added ${selectedToAdd.length} member(s) successfully`);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add members");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (email) => {
    setLoading(true);
    try {
      const updated = await removeGroupMember(group.id, email, token);
      onGroupUpdated?.(updated);
      setConfirmRemove(null);
      showSuccess(`${email.split("@")[0]} removed from group`);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    setLoading(true);
    try {
      await leaveGroup(group.id, token);
      onGroupLeft?.(group.id);
      onClose();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to leave group");
    } finally {
      setLoading(false);
    }
  };

  const handleRenameGroup = async () => {
    if (!newGroupName.trim() || newGroupName.trim() === group.name) {
      setEditingName(false);
      return;
    }
    setLoading(true);
    try {
      const updated = await updateGroupName(group.id, newGroupName.trim(), token);
      onGroupUpdated?.(updated);
      setEditingName(false);
      showSuccess("Group renamed successfully");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to rename group");
      setNewGroupName(group.name);
      setEditingName(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectToAdd = (email) => {
    setSelectedToAdd(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const getInitials = (emailOrName) => {
    const name = emailOrName?.split("@")[0] || "?";
    return name.slice(0, 2).toUpperCase();
  };

  if (!group) return null;

  return (
    <>
      {/* Overlay */}
      <div className="gp-overlay" onClick={onClose} />

      {/* Panel */}
      <div className="gp-panel slide-in">

        {/* Header */}
        <div className="gp-header">
          <div className="gp-header-title">
            {editingName ? (
              <div className="gp-rename-row">
                <input
                  className="gp-rename-input"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleRenameGroup(); if (e.key === "Escape") { setEditingName(false); setNewGroupName(group.name); } }}
                  autoFocus
                  maxLength={50}
                />
                <button className="gp-icon-btn gp-icon-btn--confirm" onClick={handleRenameGroup} title="Save">
                  <FaCheck />
                </button>
                <button className="gp-icon-btn" onClick={() => { setEditingName(false); setNewGroupName(group.name); }} title="Cancel">
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div className="gp-title-row">
                <span className="gp-group-name">{group.name}</span>
                {isAdmin && (
                  <button className="gp-icon-btn" onClick={() => setEditingName(true)} title="Rename group">
                    <FaEdit />
                  </button>
                )}
              </div>
            )}
            <span className="gp-member-count">{memberEmails.length} members</span>
          </div>
          <button className="gp-close-btn" onClick={onClose} title="Close">
            <FaTimes />
          </button>
        </div>

        {/* Notifications */}
        {success && <div className="gp-success">{success}</div>}
        {error   && <div className="gp-error">{error}</div>}

        {/* Tabs */}
        <div className="gp-tabs">
          <button
            className={`gp-tab${tab === "members" ? " gp-tab--active" : ""}`}
            onClick={() => { setTab("members"); setSearchQuery(""); }}
          >
            Members
          </button>
          {isAdmin && (
            <button
              className={`gp-tab${tab === "add" ? " gp-tab--active" : ""}`}
              onClick={() => { setTab("add"); setSearchQuery(""); }}
            >
              <FaUserPlus /> Add
            </button>
          )}
        </div>

        {/* Search */}
        <div className="gp-search">
          <FaSearch className="gp-search-icon" />
          <input
            className="gp-search-input"
            placeholder={tab === "members" ? "Search members…" : "Search people to add…"}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ── MEMBERS TAB ─────────────────────────────────────────────────── */}
        {tab === "members" && (
          <div className="gp-body">
            {filteredMembers.length === 0 && (
              <p className="gp-empty">No members found</p>
            )}
            {filteredMembers.map(email => {
              const isMemberAdmin = email.toLowerCase() === group.adminEmail?.toLowerCase();
              const isMe = email.toLowerCase() === loggedInEmail;

              return (
                <div key={email} className="gp-member-row">
                  <div className="gp-member-avatar">{getInitials(email)}</div>
                  <div className="gp-member-info">
                    <span className="gp-member-name">
                      {email.split("@")[0]}
                      {isMe && <span className="gp-you-badge"> (You)</span>}
                    </span>
                    <span className="gp-member-email">{email}</span>
                  </div>
                  <div className="gp-member-actions">
                    {isMemberAdmin && (
                      <span className="gp-admin-badge" title="Group admin">
                        <FaCrown /> Admin
                      </span>
                    )}
                    {isAdmin && !isMe && !isMemberAdmin && (
                      confirmRemove === email ? (
                        <div className="gp-confirm-row">
                          <button
                            className="gp-btn gp-btn--danger"
                            onClick={() => handleRemoveMember(email)}
                            disabled={loading}
                          >
                            Remove
                          </button>
                          <button
                            className="gp-btn gp-btn--ghost"
                            onClick={() => setConfirmRemove(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="gp-icon-btn gp-icon-btn--danger"
                          onClick={() => setConfirmRemove(email)}
                          title={`Remove ${email.split("@")[0]}`}
                        >
                          <FaTrash />
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── ADD MEMBERS TAB ─────────────────────────────────────────────── */}
        {tab === "add" && (
          <div className="gp-body">
            {selectedToAdd.length > 0 && (
              <div className="gp-chips">
                {selectedToAdd.map(email => (
                  <span key={email} className="gp-chip" onClick={() => toggleSelectToAdd(email)}>
                    {email.split("@")[0]} <FaTimes />
                  </span>
                ))}
              </div>
            )}

            {filteredNonMembers.length === 0 && (
              <p className="gp-empty">
                {searchQuery ? "No users found" : "All users are already members"}
              </p>
            )}

            {filteredNonMembers.map(u => (
              <div
                key={u.email}
                className={`gp-member-row gp-member-row--selectable${selectedToAdd.includes(u.email) ? " gp-member-row--selected" : ""}`}
                onClick={() => toggleSelectToAdd(u.email)}
              >
                <div className="gp-member-avatar">{getInitials(u.name || u.email)}</div>
                <div className="gp-member-info">
                  <span className="gp-member-name">{u.name || u.email.split("@")[0]}</span>
                  <span className="gp-member-email">{u.email}</span>
                </div>
                {selectedToAdd.includes(u.email) && (
                  <div className="gp-check-icon"><FaCheck /></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="gp-footer">
          {tab === "add" && isAdmin && (
            <button
              className="gp-btn gp-btn--primary gp-btn--full"
              onClick={handleAddMembers}
              disabled={loading || selectedToAdd.length === 0}
            >
              {loading ? "Adding…" : `Add ${selectedToAdd.length > 0 ? selectedToAdd.length + " " : ""}Member${selectedToAdd.length !== 1 ? "s" : ""}`}
            </button>
          )}

          {tab === "members" && (
            confirmLeave ? (
              <div className="gp-confirm-leave">
                <p>Are you sure you want to leave this group?</p>
                <div className="gp-confirm-row">
                  <button
                    className="gp-btn gp-btn--danger"
                    onClick={handleLeaveGroup}
                    disabled={loading}
                  >
                    {loading ? "Leaving…" : "Leave Group"}
                  </button>
                  <button
                    className="gp-btn gp-btn--ghost"
                    onClick={() => setConfirmLeave(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="gp-btn gp-btn--leave gp-btn--full"
                onClick={() => setConfirmLeave(true)}
              >
                <FaSignOutAlt /> Leave Group
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
}

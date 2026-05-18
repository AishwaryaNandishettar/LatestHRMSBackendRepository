import React, { useState, useEffect, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../Context/Authcontext";

const ALL_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABELS = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed",
  THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun"
};

const AttendanceRules = () => {
  const { user } = useContext(AuthContext);
  const [rules, setRules] = useState({ startTime: "", lateMinutes: "", halfDayHours: "" });
  const [weeklyOffDays, setWeeklyOffDays] = useState(["SATURDAY", "SUNDAY"]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing settings on mount
  useEffect(() => {
    const load = async () => {
      try {
        const companyId = user?.companyId || "";
        const res = await api.get(`/api/company-settings${companyId ? `?companyId=${companyId}` : ""}`);
        if (res.data?.weeklyOffDays) {
          setWeeklyOffDays(res.data.weeklyOffDays);
        }
      } catch (err) {
        console.error("Failed to load company settings:", err);
      }
    };
    load();
  }, [user]);

  const toggleDay = (day) => {
    setWeeklyOffDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/api/company-settings", {
        companyId: user?.companyId || "",
        weeklyOffDays,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Failed to save settings: " + (err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-section">
      <h3>Attendance Rules</h3>

      {/* ── Existing fields (unchanged) ── */}
      <div className="form-group">
        <label>Start Time</label>
        <input
          type="time"
          value={rules.startTime}
          onChange={(e) => setRules({ ...rules, startTime: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Late Minutes</label>
        <input
          type="number"
          value={rules.lateMinutes}
          onChange={(e) => setRules({ ...rules, lateMinutes: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Half Day Hours</label>
        <input
          type="number"
          value={rules.halfDayHours}
          onChange={(e) => setRules({ ...rules, halfDayHours: e.target.value })}
        />
      </div>

      {/* ── NEW: Weekly Off Days ── */}
      <div className="form-group" style={{ marginTop: 20 }}>
        <label style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 10 }}>
          📅 Weekly Off Days
          <span style={{ fontWeight: 400, fontSize: 12, color: "#6b7280", marginLeft: 8 }}>
            (Select which days employees don't need to check in)
          </span>
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ALL_DAYS.map(day => {
            const isOff = weeklyOffDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: isOff ? "2px solid #2563eb" : "2px solid #e2e8f0",
                  background: isOff
                    ? "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)"
                    : "#f8fafc",
                  color: isOff ? "#fff" : "#374151",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: isOff ? "0 2px 8px rgba(37,99,235,0.3)" : "none"
                }}
              >
                {DAY_LABELS[day]}
                {isOff && " ✓"}
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: 10, padding: "8px 12px",
          background: "#f0f9ff", borderRadius: 6,
          border: "1px solid #bae6fd", fontSize: 12, color: "#0369a1"
        }}>
          <strong>Currently off:</strong>{" "}
          {weeklyOffDays.length > 0
            ? weeklyOffDays.map(d => DAY_LABELS[d]).join(", ")
            : "None (all days are working days)"}
        </div>
      </div>

      <button
        className="save-btn"
        onClick={handleSave}
        disabled={saving}
        style={{
          marginTop: 16,
          padding: "10px 28px",
          background: saved
            ? "#16a34a"
            : "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 14,
          cursor: saving ? "not-allowed" : "pointer",
          transition: "all 0.3s"
        }}
      >
        {saving ? "Saving..." : saved ? "✅ Saved!" : "Save Settings"}
      </button>
    </div>
  );
};

export default AttendanceRules;

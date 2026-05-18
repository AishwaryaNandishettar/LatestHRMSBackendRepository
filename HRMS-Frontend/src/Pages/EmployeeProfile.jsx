import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { updateEmployee } from "../api/employeeApi";
import "./EmployeeProfile.css";

const EmployeeProfile = () => {
    const navigate = useNavigate();
  const { state } = useLocation();
  const emp = state?.employee;

   // ✅ ADD HERE (RIGHT PLACE)
  if (!emp) {
    return (
      <div style={{ padding: "20px" }}>
        <h3>No Employee Data Found</h3>
        <button onClick={() => navigate("/employee-directory")}>
          ⬅ Go Back
        </button>
      </div>
    );
  }
  // ✅ keep original data intact
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
const role = localStorage.getItem("role");
  const [formData, setFormData] = useState({
    fullName: emp?.fullName || "",
    employeeId: emp?.employeeId || "",
    department: emp?.department || "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = () => setEditMode(true);

  const handleCancel = () => {
    setFormData({
      fullName: emp?.fullName || "",
      employeeId: emp?.employeeId || "",
      department: emp?.department || "",
    });
    setEditMode(false);
  };



const handleSave = async () => {
  try {
    await updateEmployee(formData.employeeId, formData);

    alert("Saved successfully ✅");
    setEditMode(false);

    navigate(-1); // go back AFTER saving
  } catch (err) {
    console.error("Save error:", err);
    alert("Save failed ❌");
  }
};


  
  return (
    <div className="emp-profile-container">
      <div className="emp-card">

         <button
  className="back-btn"
  onClick={() => navigate(-1)}
>
  ⬅ Back to Directory
</button>   
        <h2 className="emp-title">👤 Employee Profile</h2>
          
          <div className="emp-header">
  <img
    src="https://randomuser.me/api/portraits/men/32.jpg"
    alt="avatar"
    className="emp-avatar"
  />
  <div>
  
    <h3>{formData.fullName || "Employee Name"}</h3>
    <p>{formData.department}</p>
  </div>
</div>
        <div className="emp-form">

          {/* NAME */}
          <div className="emp-field">
            <label>Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          {/* ID */}
          <div className="emp-field">
            <label>Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          {/* DEPARTMENT */}
          <div className="emp-field">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="emp-actions">
{!editMode && role === "admin" ? (
  <button className="btn edit-btn" onClick={handleEdit}>
              ✏️ Edit
            </button>
          ) : (
            <>
              <button className="btn save-btn" onClick={handleSave}>
                💾 Save
              </button>
              <button className="btn cancel-btn" onClick={handleCancel}>
                ❌ Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
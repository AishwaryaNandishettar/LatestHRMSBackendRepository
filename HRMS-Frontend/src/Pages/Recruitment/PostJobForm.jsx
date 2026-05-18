import { useState, useEffect } from "react";
import "./PostJobForm.css";
import { createJob } from "../../api/recruitmentApi";

const PostJobForm = ({ onClose, onSuccess, editData }) => {
  const [form, setForm] = useState({
    jobTitle: "",
    department: "",
    experience: "",
    skills: "",
    description: "",
    location: "",
    jobType: "",
    salary: "",
    pf: "",
    uan: "",
    esic: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      jobTitle: form.jobTitle,
      department: form.department,
      experience: form.experience,
      skills: form.skills,
      description: form.description,
      location: form.location,
      jobType: form.jobType,
      salary: form.salary,
      pf: form.pf,
      uan: form.uan,
      esic: form.esic,
      status: "Open",
      applicants: 0
    };

    try {
      await createJob(payload);
      onSuccess();   // refresh table
      onClose();     // close modal
    } catch (err) {
      console.error("Job creation failed:", err);
    }
  };

  useEffect(() => {
    if (editData) setForm(editData);
  }, [editData]);

  return (
    <form className="postjob-card" onSubmit={handleSubmit}>

      <div className="postjob-header">
        <h2>Post Job Details</h2>
        <p>Enter structured job information</p>
      </div>

      <div className="postjob-grid">

        <div className="field">
          <label>Location</label>
          <input name="location" onChange={handleChange} />
        </div>

        <div className="field">
          <label>Domain</label>
          <select name="jobType" onChange={handleChange}>
            <option value="">Select</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Internship</option>
            <option>Contract</option>
          </select>
        </div>

        <div className="field">
          <label>Salary</label>
          <input name="salary" onChange={handleChange} />
        </div>

        <div className="field">
          <label>Domain</label>
          <input name="jobTitle" onChange={handleChange} required />
        </div>

        <div className="field">
          <label>Department</label>
          <input name="department" onChange={handleChange} required />
        </div>

        <div className="field">
          <label>Experience</label>
          <input name="experience" onChange={handleChange} />
        </div>

        <div className="field">
          <label>Skills</label>
          <input name="skills" onChange={handleChange} />
        </div>

        <div className="field">
          <label>PF (Provident Fund)</label>
          <input name="pf" onChange={handleChange} placeholder="e.g., 12%" />
        </div>

        <div className="field">
          <label>UAN (Universal Account Number)</label>
          <input name="uan" onChange={handleChange} placeholder="e.g., 100099999999" />
        </div>

        <div className="field">
          <label>ESIC (Employees' State Insurance)</label>
          <input name="esic" onChange={handleChange} placeholder="e.g., 0.75%" />
        </div>

        <div className="field full">
          <label>Job Description</label>
          <textarea name="description" onChange={handleChange} />
        </div>

      </div>

      {/* Preview */}
      <div className="postjob-preview">
        <h4>Preview</h4>
        <pre>
          {JSON.stringify(
            { ...form, status: "Open" },
            null,
            2
          )}
        </pre>
      </div>

      <div className="postjob-actions">
        <button className="primary" type="submit">
          Submit
        </button>

        <button
          className="secondary"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>

    </form>
  );
};

export default PostJobForm;

import { useState, useEffect, useRef } from "react";
import "./ReleaseOfferLetterModal.css";

import {
  renderPdfToImages,
  replacePlaceholdersInPdf,
  extractEditableFields,
  applyFieldEditsTopdf,
} from "./pdfUtils";
import {
  uploadOfferTemplate,
  getAllTemplates,
  getTemplatePreview,
  saveOfferLetter,
} from "../../api/recruitmentApi";

export default function ReleaseOfferLetterModal({ job, onClose }) {

  // ── TABS ──
  const [activeTab, setActiveTab] = useState("upload");

  // ── FORM DATA ──
  const [form, setForm] = useState({
    candidateName: job?.candidateName || "",
    candidateEmail: job?.candidateEmail || "",
    position: job?.jobTitle || "",
    department: job?.department || "",
    location: job?.location || "",
    joiningDate: job?.onboardingDate || "",
    ctc: job?.ctc || "",
    basic: job?.basic || "",
    hra: job?.hra || "",
    allowances: job?.allowances || "",
    bonus: job?.bonus || "",
    probationPeriod: "3 months",
    noticePeriod: job?.noticePeriod || "60 days",
    offerValidUntil: "",
    companyName: "OMOIKANE INNOVATIONS PVT LTD",
    grade: "",
    grossSalary: "",
    variablePay: "",
  });

  // ── TEMPLATE STATE ──
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    templateName: "",
    companyName: "",
    description: "",
  });

  // ── PDF STATE ──
  const [pdfPageImages, setPdfPageImages] = useState([]);
  // editableFields: array of { page, index, originalText, value, x, y, width, height, fontSize, pageWidth, pageHeight }
  const [editableFields, setEditableFields] = useState([]);
  const [pdfRendering, setPdfRendering] = useState(false);

  // ── STATUS ──
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // ── INLINE EDIT STATE ──
  // When user clicks a field, show an inline input overlay instead of prompt()
  const [activeEdit, setActiveEdit] = useState(null); // { field, inputValue }

  const fileInputRef = useRef(null);
  // refs to each page image element so we can measure rendered size
  const pageImgRefs = useRef([]);

  // ── LOAD TEMPLATES ON MOUNT ──
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getAllTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load templates:", err);
      setTemplates([]);
    }
  };

  // ── HANDLE FILE SELECTION ──
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) { setStatus({ type: "error", message: "No file selected" }); return; }
    if (file.type !== "application/pdf") {
      setStatus({ type: "error", message: "Please select a PDF file." }); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus({ type: "error", message: "File too large (max 10 MB)." }); return;
    }
    setUploadFile(file);
    setStatus({ type: "info", message: `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)` });
  };

  // ── UPLOAD TEMPLATE ──
  const handleUploadTemplate = async () => {
    if (!uploadFile) { setStatus({ type: "error", message: "Please select a PDF file" }); return; }
    if (!uploadMetadata.templateName || !uploadMetadata.companyName) {
      setStatus({ type: "error", message: "Template name and company name are required" }); return;
    }
    setUploading(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("templateName", uploadMetadata.templateName.trim());
      formData.append("companyName", uploadMetadata.companyName.trim());
      formData.append("description", uploadMetadata.description.trim());
      formData.append("uploadedBy", "Admin");

      const response = await uploadOfferTemplate(formData);
      const templateId = response?.templateId || response?.data?.templateId;
      if (!templateId) throw new Error("No template ID received from server.");

      setStatus({ type: "success", message: "Template uploaded successfully!" });
      await loadTemplates();
      setSelectedTemplate(templateId);
      await loadTemplatePreview(templateId);
      setActiveTab("preview");
      setUploadFile(null);
      setUploadMetadata({ templateName: "", companyName: "", description: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      let msg = err?.response?.data?.message || err?.message || "Upload failed";
      if (msg.includes("pattern data")) msg = "File upload validation error. Try a different PDF.";
      setStatus({ type: "error", message: msg });
    } finally {
      setUploading(false);
    }
  };

  // ── LOAD TEMPLATE PREVIEW ──
  const loadTemplatePreview = async (templateId) => {
    if (!templateId) { setStatus({ type: "error", message: "No template ID provided" }); return; }
    setPdfRendering(true);
    setStatus({ type: "info", message: "Loading template preview..." });
    try {
      const response = await getTemplatePreview(templateId);
      if (!response?.pdfBase64) throw new Error("No PDF data received from server.");

      const base64 = response.pdfBase64;
      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

      if (String.fromCharCode(...bytes.slice(0, 4)) !== "%PDF")
        throw new Error("Invalid PDF format.");

      // Store master copy
      window.originalPdfBytes = bytes.buffer.slice(0);

      // Render images
      const images = await renderPdfToImages(bytes.buffer.slice(0));
      if (!images || images.length === 0) throw new Error("PDF rendering failed.");
      setPdfPageImages(images);

      // Extract ALL text fields for editing
      const fields = await extractEditableFields(bytes.buffer.slice(0));
      setEditableFields(fields);

      setStatus({ type: "success", message: `Template loaded successfully (${images.length} page${images.length > 1 ? "s" : ""})` });
    } catch (err) {
      console.error("Failed to load template:", err);
      setStatus({ type: "error", message: err?.message || "Failed to load template" });
      setPdfPageImages([]);
      setEditableFields([]);
    } finally {
      setPdfRendering(false);
    }
  };

  // ── SELECT EXISTING TEMPLATE ──
  const handleSelectTemplate = async (templateId) => {
    setSelectedTemplate(templateId);
    await loadTemplatePreview(templateId);
    setActiveTab("preview");
  };

  // ── CLICK ON A TEXT FIELD IN EDIT MODE ──
  const handleFieldClick = (field) => {
    setActiveEdit({ field, inputValue: field.value });
  };

  // ── CONFIRM INLINE EDIT ──
  const handleEditConfirm = () => {
    if (!activeEdit) return;
    const { field, inputValue } = activeEdit;
    const updatedFields = editableFields.map(f =>
      f.page === field.page && f.index === field.index
        ? { ...f, value: inputValue }
        : f
    );
    setEditableFields(updatedFields);
    setActiveEdit(null);
    // Re-render preview with updated text
    updatePdfPreviewWithFields(updatedFields);
  };

  // ── CANCEL INLINE EDIT ──
  const handleEditCancel = () => setActiveEdit(null);

  // ── RE-RENDER PDF WITH EDITED FIELDS ──
  const updatePdfPreviewWithFields = async (fields) => {
    if (!window.originalPdfBytes) return;
    setPdfRendering(true);
    try {
      const freshBuffer = window.originalPdfBytes.slice(0);
      // Apply all field edits (white-out original text, draw new text)
      const modifiedPdf = await applyFieldEditsTopdf(freshBuffer, fields);
      const images = await renderPdfToImages(modifiedPdf.buffer);
      setPdfPageImages(images);
    } catch (err) {
      console.error("Failed to update preview:", err);
    } finally {
      setPdfRendering(false);
    }
  };

  // ── DOWNLOAD FINAL PDF ──
  const handleDownload = async () => {
    if (!window.originalPdfBytes) {
      setStatus({ type: "error", message: "No template loaded" }); return;
    }
    setDownloading(true);
    try {
      const freshBuffer = window.originalPdfBytes.slice(0);
      // Apply field edits first, then placeholder replacements
      const withEdits = await applyFieldEditsTopdf(freshBuffer, editableFields);
      const finalPdfBytes = await replacePlaceholdersInPdf(withEdits.buffer, form);

      const blob = new Blob([finalPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Offer_Letter_${(form.candidateName || "Candidate").replace(/\s+/g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus({ type: "success", message: "PDF downloaded successfully!" });

      try {
        await saveOfferLetter({
          ...form,
          jobId: job?.id,
          templateId: selectedTemplate,
          generatedAt: new Date().toISOString(),
        });
      } catch (_) { /* silent */ }
    } catch (err) {
      setStatus({ type: "error", message: "Download failed: " + (err?.message || "Unknown error") });
    } finally {
      setDownloading(false);
    }
  };

  // ── SEND EMAIL ──
  const handleSendEmail = async () => {
    if (!window.originalPdfBytes) {
      setStatus({ type: "error", message: "No template loaded" }); 
      return;
    }

    // ✅ Prompt user to enter recipient email address
    const recipientEmail = prompt(
      "Enter recipient email address:",
      form.candidateEmail || ""
    );

    // User cancelled or entered empty email
    if (!recipientEmail || recipientEmail.trim() === "") {
      setStatus({ type: "info", message: "Email sending cancelled" });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail.trim())) {
      setStatus({ type: "error", message: "Invalid email address format" });
      return;
    }

    setStatus({ type: "info", message: "Sending email..." });

    try {
      const freshBuffer = window.originalPdfBytes.slice(0);
      const withEdits = await applyFieldEditsTopdf(freshBuffer, editableFields);
      const finalPdfBytes = await replacePlaceholdersInPdf(withEdits.buffer, form);

      const blob = new Blob([finalPdfBytes], { type: "application/pdf" });
      const candidateName = form.candidateName || "Candidate";
      const file = new File(
        [blob], 
        `Offer_Letter_${candidateName.replace(/\s+/g, "_")}.pdf`, 
        { type: "application/pdf" }
      );

      const emailFormData = new FormData();
      emailFormData.append("to", recipientEmail.trim());
      emailFormData.append("subject", `Offer Letter - ${form.position || "Position"}`);
      emailFormData.append("candidateName", candidateName);
      emailFormData.append("file", file);

      console.log("Sending email to:", recipientEmail.trim());
      console.log("Subject:", `Offer Letter - ${form.position || "Position"}`);
      console.log("Candidate name:", candidateName);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8082"}/api/offer-templates/send-offer-letter`,
        {
          method: "POST",
          body: emailFormData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Email sending failed:", errorText);
        throw new Error(`Email sending failed: ${errorText || response.statusText}`);
      }

      const result = await response.text();
      console.log("Email sent successfully:", result);

      setStatus({ 
        type: "success", 
        message: `✅ Offer letter sent successfully to ${recipientEmail}!` 
      });

      // Update form with the email used
      setForm(prev => ({ ...prev, candidateEmail: recipientEmail.trim() }));

    } catch (err) {
      console.error("Email sending error:", err);
      setStatus({ 
        type: "error", 
        message: `Email sending failed: ${err.message || "Unknown error"}` 
      });
    }
  };

  // ── COMPUTE OVERLAY POSITION ──
  // PDF coords: origin bottom-left, Y increases upward.
  // CSS coords: origin top-left, Y increases downward.
  // We need to flip Y and scale from PDF points to rendered pixels.
  const getOverlayStyle = (field, pageIdx) => {
    const imgEl = pageImgRefs.current[pageIdx];
    if (!imgEl || !field.pageWidth || !field.pageHeight) {
      // Fallback: just use raw coords (will be approximate)
      return {
        position: "absolute",
        left: `${field.x}px`,
        top: `${field.y}px`,
        width: `${field.width || 80}px`,
        height: `${field.height || 16}px`,
      };
    }

    const renderedW = imgEl.clientWidth;
    const renderedH = imgEl.clientHeight;

    const scaleX = renderedW / field.pageWidth;
    const scaleY = renderedH / field.pageHeight;

    // PDF Y is from bottom; CSS Y is from top
    const cssLeft = field.x * scaleX;
    const cssTop = renderedH - (field.y + field.height) * scaleY;
    const cssWidth = (field.width || 80) * scaleX;
    const cssHeight = (field.height || 16) * scaleY;

    return {
      position: "absolute",
      left: `${cssLeft}px`,
      top: `${cssTop}px`,
      width: `${cssWidth}px`,
      height: `${Math.max(cssHeight, 14)}px`,
    };
  };

  // ── RENDER ──
  return (
    <div className="release-offer-modal-overlay" onClick={onClose}>
      <div className="release-offer-modal" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="modal-header">
          <h2>📄 Release Offer Letter</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* TABS */}
        <div className="modal-tabs">
          <button className={activeTab === "upload" ? "active" : ""} onClick={() => setActiveTab("upload")}>
            📤 Upload Template
          </button>
          <button
            className={activeTab === "preview" ? "active" : ""}
            onClick={() => setActiveTab("preview")}
            disabled={pdfPageImages.length === 0}
          >
            👁️ Preview
          </button>
          <button
            className={activeTab === "edit" ? "active" : ""}
            onClick={() => setActiveTab("edit")}
            disabled={pdfPageImages.length === 0}
          >
            ✏️ Edit Fields
          </button>
        </div>

        {/* STATUS */}
        {status && <div className={`status-message ${status.type}`}>{status.message}</div>}

        {/* BODY */}
        <div className="modal-body" onClick={(e) => e.stopPropagation()}>

          {/* ── UPLOAD TAB ── */}
          {activeTab === "upload" && (
            <div className="upload-section">
              <h3>Upload New Template</h3>
              <div className="upload-form">
                <div className="form-group">
                  <label>Template Name *</label>
                  <input type="text" placeholder="e.g., Standard Offer Letter"
                    value={uploadMetadata.templateName}
                    onChange={(e) => setUploadMetadata(p => ({ ...p, templateName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Company Name *</label>
                  <input type="text" placeholder="e.g., OMOIKANE INNOVATIONS"
                    value={uploadMetadata.companyName}
                    onChange={(e) => setUploadMetadata(p => ({ ...p, companyName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea placeholder="Brief description" value={uploadMetadata.description} rows={3}
                    onChange={(e) => setUploadMetadata(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Select PDF Template *</label>
                  <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileSelect} />
                  {uploadFile && <div className="file-info">✅ {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)</div>}
                </div>
                <button className="btn-primary" onClick={handleUploadTemplate} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Template"}
                </button>
              </div>

              <hr />

              <h3>Or Select Existing Template</h3>
              <div className="templates-grid">
                {templates.length === 0 ? (
                  <p className="no-templates">No templates available. Upload one above.</p>
                ) : (
                  templates.map(t => (
                    <div key={t.id}
                      className={`template-card ${selectedTemplate === t.id ? "selected" : ""}`}
                      onClick={() => handleSelectTemplate(t.id)}>
                      <div className="template-icon">📄</div>
                      <div className="template-name">{t.templateName}</div>
                      <div className="template-company">{t.companyName}</div>
                      <div className="template-date">{new Date(t.uploadedAt).toLocaleDateString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── PREVIEW TAB ── */}
          {activeTab === "preview" && (
            <div className="preview-section">
              <h3>Template Preview</h3>
              {pdfRendering ? (
                <div className="loading">Rendering PDF...</div>
              ) : pdfPageImages.length > 0 ? (
                <div className="pdf-preview">
                  {pdfPageImages.map((imgSrc, idx) => (
                    <div key={idx} className="pdf-page">
                      <img src={imgSrc} alt={`Page ${idx + 1}`} />
                      <div className="page-number">Page {idx + 1}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-preview">No preview available</div>
              )}
              <div className="preview-actions">
                <button className="btn-secondary" onClick={() => setActiveTab("edit")} disabled={pdfPageImages.length === 0}>
                  Next: Edit Fields →
                </button>
              </div>
            </div>
          )}

          {/* ── EDIT TAB ── */}
          {activeTab === "edit" && (
            <div className="edit-section">
              <div className="edit-hint">
                💡 <strong>Click on any text</strong> in the document below to edit it directly.
              </div>

              {pdfRendering ? (
                <div className="loading">Updating preview...</div>
              ) : pdfPageImages.length > 0 ? (
                <div className="pdf-preview-editor">
                  {pdfPageImages.map((imgSrc, pageIdx) => (
                    <div
                      key={pageIdx}
                      className="pdf-page-editor"
                      style={{ position: "relative", display: "inline-block", width: "100%" }}
                    >
                      {/* The rendered PDF page image */}
                      <img
                        ref={el => pageImgRefs.current[pageIdx] = el}
                        src={imgSrc}
                        alt={`Page ${pageIdx + 1}`}
                        className="editable-pdf-image"
                        style={{ width: "100%", display: "block" }}
                      />

                      {/* Clickable overlays for every text element on this page */}
                      {editableFields
                        .filter(f => f.page === pageIdx)
                        .map((field) => {
                          const overlayStyle = getOverlayStyle(field, pageIdx);
                          const isBeingEdited =
                            activeEdit?.field.page === field.page &&
                            activeEdit?.field.index === field.index;

                          return isBeingEdited ? (
                            /* ── INLINE EDIT INPUT ── */
                            <div
                              key={`edit-${field.page}-${field.index}`}
                              style={{
                                ...overlayStyle,
                                zIndex: 200,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <input
                                autoFocus
                                className="inline-edit-input"
                                value={activeEdit.inputValue}
                                onChange={(e) => setActiveEdit(prev => ({ ...prev, inputValue: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleEditConfirm();
                                  if (e.key === "Escape") handleEditCancel();
                                }}
                                style={{
                                  width: "100%",
                                  fontSize: `${Math.max((field.fontSize || 12) * (overlayStyle.width ? parseFloat(overlayStyle.width) / (field.width || 80) : 1), 10)}px`,
                                  padding: "1px 3px",
                                  border: "2px solid #2563eb",
                                  borderRadius: 3,
                                  background: "#fff",
                                  outline: "none",
                                }}
                              />
                              <button
                                onClick={handleEditConfirm}
                                style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 3, padding: "2px 6px", cursor: "pointer", fontSize: 11, whiteSpace: "nowrap" }}
                              >✓</button>
                              <button
                                onClick={handleEditCancel}
                                style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 3, padding: "2px 6px", cursor: "pointer", fontSize: 11 }}
                              >✕</button>
                            </div>
                          ) : (
                            /* ── HOVER HIGHLIGHT OVERLAY ── */
                            <div
                              key={`field-${field.page}-${field.index}`}
                              className="pdf-text-overlay"
                              title={`Click to edit: "${field.value}"`}
                              onClick={() => handleFieldClick(field)}
                              style={{
                                ...overlayStyle,
                                cursor: "text",
                                zIndex: 100,
                                background: "transparent",
                                border: "1px solid transparent",
                                borderRadius: 2,
                                transition: "background 0.15s, border-color 0.15s",
                              }}
                            />
                          );
                        })}

                      <div className="page-number">Page {pageIdx + 1}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-preview"><p>No preview available</p></div>
              )}

              <div className="form-actions">
                <button className="btn-secondary" onClick={handleSendEmail}>
                  📧 Send Offer Letter
                </button>
                <button className="btn-primary" onClick={handleDownload} disabled={downloading}>
                  {downloading ? "Generating..." : "📥 Download PDF"}
                </button>
              </div>
            </div>
          )}

          {/* ── DOWNLOAD TAB ── */}
          {activeTab === "download" && (
            <div className="download-section">
              <h3>Download Final PDF</h3>
              <div className="download-summary">
                <h4>Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item"><strong>Candidate:</strong> {form.candidateName || "Not specified"}</div>
                  <div className="summary-item"><strong>Position:</strong> {form.position || "Not specified"}</div>
                  <div className="summary-item"><strong>CTC:</strong> {form.ctc || "Not specified"}</div>
                  <div className="summary-item"><strong>Joining Date:</strong> {form.joiningDate || "Not specified"}</div>
                </div>
              </div>
              <div className="download-actions">
                <button className="btn-primary large" onClick={handleDownload} disabled={downloading}>
                  {downloading ? "Generating PDF..." : "📥 Download Final Offer Letter"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

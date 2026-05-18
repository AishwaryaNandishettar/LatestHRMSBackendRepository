import React, { useState, useRef, useEffect, useCallback } from "react";
import "./OfferLetterModal.css";
import { sendOfferLetter, saveOfferLetter } from "../../api/recruitmentApi";
import { replacePlaceholdersInPdf, renderPdfToImages } from "./pdfUtils";

/* -------------------------------------------------------------
   DEFAULT POLICY CONTENT � editable by admin in Policies tab
------------------------------------------------------------- */
const DEFAULT_POLICIES = {
  rulesRegulations: `1. Employees must report to work on time and maintain regular attendance.
2. Working hours are 9:00 AM to 6:00 PM, Monday to Friday (Saturday optional based on project).
3. Professional dress code must be maintained at all times in the office.
4. Employees must treat all colleagues, clients, and vendors with respect and professionalism.
5. Use of mobile phones for personal calls during work hours should be minimized.
6. Any misconduct, insubordination, or violation of company rules may result in disciplinary action.`,

  companyPolicies: `1. All employees must sign and adhere to the Non-Disclosure Agreement (NDA).
2. Intellectual property created during employment belongs to the company.
3. Employees must not engage in any activity that conflicts with the company's interests.
4. Confidential information must not be shared with external parties without written approval.
5. Social media usage must not reflect negatively on the company or its clients.
6. Any outside employment or consulting must be disclosed and approved by management.`,

  leavePolicies: `Casual Leave (CL): 6 days per year (non-carry-forward)
Sick Leave (SL): 6 days per year (non-carry-forward)
Earned Leave (EL): 15 days per year (carry-forward up to 30 days)
Maternity Leave: 26 weeks as per Maternity Benefit Act
Paternity Leave: 5 days
Leave Without Pay (LWP): Applicable when all leaves are exhausted
Leave must be applied in advance via the HRMS portal (except emergencies).
Unapproved absences will be treated as Leave Without Pay.`,

  holidayPolicies: `The company observes the following public holidays (subject to annual revision):
Republic Day - 26th January
Holi - As per calendar
Good Friday - As per calendar
Independence Day - 15th August
Gandhi Jayanti - 2nd October
Dussehra - As per calendar
Diwali (2 days) - As per calendar
Christmas - 25th December
New Year's Day - 1st January
Additional regional/optional holidays may be declared by management.`,

  securityPolicies: `1. All employees must use strong passwords (min. 8 characters, alphanumeric + special).
2. Passwords must not be shared with anyone, including IT staff.
3. Company laptops/devices must not be used for personal activities or unauthorized software.
4. Employees must lock their screens when leaving their workstation.
5. Sensitive data must not be stored on personal devices or external drives without approval.
6. Any security breach or suspicious activity must be reported to IT immediately.
7. Employees must comply with the company's Data Protection and Privacy Policy.
8. Remote work must be done over a secure, approved VPN connection.`,
};

/* ---------------------------------------------
   Build policy HTML block helper
--------------------------------------------- */
function policyBlock(title, icon, content) {
  const lines = (content || "").split("\n").filter(Boolean);
  const items = lines.map(l => `<div class="pol-item">${l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>`).join("");
  return `<div class="pol-sec">
    <div class="pol-title">${icon}&nbsp; ${title}</div>
    <div class="pol-body">${items}</div>
  </div>`;
}

/* ---------------------------------------------
   Build the full offer letter HTML
   (Hero FinCorp style � detailed salary table)
--------------------------------------------- */
function buildDefaultHTML(form, policies, signatureDataUrl) {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric"
  }).split("/").join("-");
  const esc = (s) => (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  // Compute monthly from annual string (strips non-numeric chars)
  const monthly = (annual) => {
    if (!annual) return "-";
    const n = parseFloat((annual + "").replace(/[^0-9.]/g, ""));
    if (isNaN(n)) return "-";
    return Math.round(n / 12).toLocaleString("en-IN");
  };

  const salRow = (label, annual, isBold) => {
    if (!annual) return "";
    const cls = isBold ? ' class="sub-total"' : "";
    return `<tr${cls}><td${isBold ? " style='font-weight:700'" : ""}>${esc(label)}</td>
      <td${isBold ? " style='font-weight:700'" : ""}>${esc(annual)}</td>
      <td${isBold ? " style='font-weight:700'" : ""}>${monthly(annual)}</td></tr>`;
  };

  const sigBlock = signatureDataUrl
    ? `<div class="sig-wrap signed">
        <div class="sig-box">
          <img src="${signatureDataUrl}" class="sig-img" alt="Signature"/>
          <div class="sig-lbl">Candidate Signature</div>
          <div class="sig-date">Signed: ${new Date().toLocaleString("en-IN")}</div>
        </div>
        <div class="sig-box">
          <div class="sig-blank"></div>
          <div class="sig-lbl">${esc(form.hrName) || "HR / Authorized Signatory"}</div>
          <div class="sig-lbl" style="font-weight:400;color:#9ca3af">${esc(form.hrDesignation) || ""}</div>
        </div>
      </div>`
    : `<div class="sig-wrap">
        <div class="sig-box"><div class="sig-blank"></div><div class="sig-lbl">Candidate Signature &amp; Date</div></div>
        <div class="sig-box"><div class="sig-blank"></div>
          <div class="sig-lbl">${esc(form.hrName) || "HR / Authorized Signatory"}</div>
          <div class="sig-lbl" style="font-weight:400;color:#9ca3af">${esc(form.hrDesignation) || ""}</div>
        </div>
      </div>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#222;line-height:1.75;font-size:13px;background:#fff}
.page{max-width:780px;margin:0 auto;padding:0;border:1px solid #ccc}
.hdr{padding:18px 36px;border-bottom:2px solid #1e3a5f;display:flex;justify-content:space-between;align-items:flex-start}
.co-name{font-size:20px;font-weight:700;color:#1e3a5f;letter-spacing:.5px}
.co-sub{font-size:11px;color:#6b7280;margin-top:3px}
.body{padding:28px 36px}
.date-line{font-weight:700;font-size:13px;margin-bottom:4px}
.cand-name{font-weight:700;font-size:13px;margin-bottom:18px}
.dear{font-weight:700;text-decoration:underline;margin-bottom:10px;font-size:13px}
p{margin-bottom:12px;font-size:13px;text-align:justify;line-height:1.75}
strong{font-weight:700}
/* Salary table */
.sal-table{width:100%;border-collapse:collapse;margin:18px 0}
.sal-table caption{font-weight:700;font-size:12px;background:#1e3a5f;color:#fff;padding:7px 12px;text-align:center;letter-spacing:1px}
.sal-table th{background:#f0f4f8;padding:7px 12px;text-align:left;font-size:12px;border:1px solid #d1d5db;font-weight:700}
.sal-table td{padding:6px 12px;border:1px solid #d1d5db;font-size:12px}
.sal-table .sub-total td{font-weight:700;background:#e8f0fe}
.sal-table .grand-total td{font-weight:700;background:#1e3a5f;color:#fff}
/* Notes */
.notes{margin-top:20px;font-size:12px}
.notes p{font-style:italic;text-align:justify;margin-bottom:6px;line-height:1.7}
/* Policies */
.pol-wrap{margin-top:24px;border-top:2px solid #1e3a5f;padding-top:20px}
.pol-heading{font-size:13px;font-weight:700;color:#1e3a5f;text-align:center;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px}
.pol-sub{font-size:11px;color:#6b7280;text-align:center;margin-bottom:16px}
.pol-sec{margin-bottom:12px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden}
.pol-title{background:#1e3a5f;color:#fff;padding:7px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
.pol-body{padding:10px 14px;background:#fafafa}
.pol-item{font-size:12px;color:#374151;line-height:1.8;padding:1px 0}
/* Acceptance */
.accept-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:10px 14px;font-size:12px;color:#166534;margin:16px 0}
/* Signature */
.sig-wrap{display:flex;gap:60px;margin-top:28px;flex-wrap:wrap}
.sig-wrap.signed .sig-box:first-child{border:2px solid #16a34a;border-radius:8px;padding:10px;background:#f0fdf4}
.sig-box{min-width:200px}
.sig-img{max-width:200px;max-height:70px;display:block;margin-bottom:4px}
.sig-blank{border-top:1px solid #555;width:200px;margin-top:44px;margin-bottom:5px}
.sig-lbl{font-size:12px;font-weight:700;color:#222}
.sig-date{font-size:10px;color:#16a34a;font-weight:600;margin-top:2px}
/* Important note */
.imp-note{margin-top:24px;border-top:1px solid #e5e7eb;padding-top:14px}
.imp-note p{font-style:italic;font-size:12px;text-align:justify;margin-bottom:6px;line-height:1.7}
.ftr{background:#f8fafc;padding:12px 36px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;text-align:center;margin-top:24px}
@media print{.page{border:none}}
</style></head><body><div class="page">

<div class="hdr">
  <div>
    <div class="co-name">${esc(form.companyName) || "Company Name"}</div>
    <div class="co-sub">Official Offer Letter</div>
  </div>
</div>

<div class="body">
<div class="date-line">Dated: ${today}</div>
<div class="cand-name">${esc(form.candidateName) || "Candidate Name"}</div>

<p class="dear">Dear ${esc((form.candidateName || "Candidate").split(" ")[0])},</p>

<p>With reference to your application and subsequent interview, we are pleased to offer you the post of <strong>${esc(form.position) || "___________"}</strong>${form.grade ? ` in <strong>${esc(form.grade)}</strong>` : ""} in our Organization at <strong>${esc(form.location) || "our office"}</strong> on the terms and conditions, mutually agreed upon.</p>

<p>Please note that this is a Letter of Intent only and detailed Letter of Appointment shall be issued to you on joining your duties with us. In case, the terms and conditions are acceptable to you, please join the duties with us on or before <strong>${esc(form.joiningDate) || "___________"}</strong>.</p>

<table class="sal-table">
  <caption>SALARY COMPUTATION</caption>
  <thead><tr><th>Components</th><th>Per Annum</th><th>Per Month</th></tr></thead>
  <tbody>
    ${salRow("Basic", form.basic, false)}
    ${salRow("HRA", form.hra, false)}
    ${salRow("Special Allowance", form.allowances, false)}
    ${form.educationAllowance ? salRow("Education Allowance", form.educationAllowance, false) : ""}
    ${form.lta ? salRow("LTA", form.lta, false) : ""}
    <tr class="sub-total"><td style="font-weight:700">Gross Salary</td><td style="font-weight:700">${esc(form.grossSalary || form.ctc)}</td><td style="font-weight:700">${monthly(form.grossSalary || form.ctc)}</td></tr>
    ${form.mealCard ? salRow("Meal Card", form.mealCard, false) : ""}
    ${form.pf ? salRow("Provident Fund", form.pf, false) : ""}
    ${form.gpa ? salRow("GPA", form.gpa, false) : ""}
    ${form.glic ? salRow("GLIC", form.glic, false) : ""}
    ${form.mediClaim ? salRow("Medi Claim", form.mediClaim, false) : ""}
    ${form.totalSsb ? `<tr class="sub-total"><td style="font-weight:700">Total SSB</td><td style="font-weight:700">${esc(form.totalSsb)}</td><td style="font-weight:700">${monthly(form.totalSsb)}</td></tr>` : ""}
    <tr class="sub-total"><td style="font-weight:700">Gross Fixed CTC</td><td style="font-weight:700">${esc(form.grossFixedCtc || form.ctc)}</td><td style="font-weight:700">${monthly(form.grossFixedCtc || form.ctc)}</td></tr>
    ${form.variablePay ? `<tr><td>Annual Variable Pay</td><td>${esc(form.variablePay)}</td><td>-</td></tr>` : ""}
    <tr class="grand-total"><td>Total Cost to Company</td><td>${esc(form.ctc)}</td><td>-</td></tr>
  </tbody>
</table>

<div class="notes">
  <p>&#x2022; Gratuity will be applicable as per law.</p>
  <p>&#x2022; Annual Performance based Variable Pay is applicable only for non-incentivized employees and will be paid as per Company Policy.</p>
  <p>&#x2022; For payout towards Variable Pay / Incentive programs, per the incentive policy the employee must remain an active employee of the Company (not having served notice of resignation), in good standing as determined by the Company in its sole discretion, without violation of any Company policies or procedures, in each case, as on the date of payout.</p>
</div>

<p style="margin-top:20px">Thanking you,</p>
<p>Yours sincerely,</p>
<p><strong>For ${esc(form.companyName) || "Company"}</strong></p>

${sigBlock}

<div class="imp-note">
  <p style="font-weight:700;font-style:normal;margin-bottom:8px">Important Note: -</p>
  <p>a) By signing this letter, you consent ${esc(form.companyName) || "the Company"} to conduct your background verification before joining. Please note that the Company reserves the right to cancel/withdraw the offer in case of any negative/adverse inference that may arise out of the scheduled background checks.</p>
  <p>b) As per company policy, if an employee resigns from the company within eighteen months of the date of joining, in that case all the joining expenses incurred by the company - relocation (packers &amp; movers), lodging / hotel expenses, joining travel, notice pay amount, joining bonus etc. will be recovered from the employee as applicable.</p>
</div>

<div class="pol-wrap">
  <div class="pol-heading">Company Policies &amp; Guidelines</div>
  <div class="pol-sub">By accepting this offer, you acknowledge that you have read, understood, and agree to abide by all the following policies.</div>
  ${policyBlock("Rules &amp; Regulations", "&#128204;", policies.rulesRegulations)}
  ${policyBlock("Company Policies", "&#127970;", policies.companyPolicies)}
  ${policyBlock("Leave Policies", "&#127964;", policies.leavePolicies)}
  ${policyBlock("Holiday Policies", "&#127881;", policies.holidayPolicies)}
  ${policyBlock("Security Policies", "&#128274;", policies.securityPolicies)}
</div>

<div class="accept-box" style="margin-top:20px">
  I, <strong>${esc(form.candidateName) || "___________"}</strong>, hereby accept the offer of employment as
  <strong>${esc(form.position) || "___________"}</strong> at <strong>${esc(form.companyName) || "the Company"}</strong>
  and confirm that I have read and agree to all the policies mentioned above.
</div>

</div>
<div class="ftr">${esc(form.companyName) || "Company"} | This is an official offer letter. For queries, contact HR directly.</div>
</div></body></html>`;
}

/* ---------------------------------------------
   Replace {{placeholders}} in uploaded template
--------------------------------------------- */
function applyPlaceholders(html, form) {
  const map = {
    "{{candidateName}}":   form.candidateName   || "",
    "{{candidateEmail}}":  form.candidateEmail  || "",
    "{{position}}":        form.position        || "",
    "{{department}}":      form.department      || "",
    "{{location}}":        form.location        || "",
    "{{joiningDate}}":     form.joiningDate     || "",
    "{{ctc}}":             form.ctc             || "",
    "{{basic}}":           form.basic           || "",
    "{{hra}}":             form.hra             || "",
    "{{allowances}}":      form.allowances      || "",
    "{{bonus}}":           form.bonus           || "",
    "{{probationPeriod}}": form.probationPeriod || "",
    "{{noticePeriod}}":    form.noticePeriod    || "",
    "{{offerValidUntil}}": form.offerValidUntil || "",
    "{{companyName}}":     form.companyName     || "",
    "{{today}}": new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
  };
  let result = html;
  Object.entries(map).forEach(([k, v]) => { result = result.split(k).join(v); });
  return result;
}

/* -----------------------------------------------------------
   Build a live HTML preview for PDF-uploaded templates.
   Since we can't parse/edit PDF content in the browser,
   we render a styled letter using the form values so the
   user can see all their edits reflected in real time.
   The actual PDF is used only for Download.
----------------------------------------------------------- */
function buildPdfPlaceholderPreview(form) {
  const esc = (s) => (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const row = (label, val) => val
    ? `<tr><td style="padding:6px 12px;border:1px solid #d1d5db;font-size:12px;color:#6b7280;width:40%">${label}</td>
         <td style="padding:6px 12px;border:1px solid #d1d5db;font-size:12px;font-weight:600">${esc(val)}</td></tr>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#222;line-height:1.75;font-size:13px;background:#f8fafc;padding:20px}
.card{background:#fff;border-radius:10px;border:1px solid #e5e7eb;overflow:hidden;max-width:700px;margin:0 auto}
.hdr{background:#1e3a5f;color:#fff;padding:18px 28px}
.hdr h2{font-size:16px;font-weight:700;margin-bottom:2px}
.hdr p{font-size:12px;opacity:.8}
.notice{background:#fef3c7;border-bottom:1px solid #fde68a;padding:10px 20px;font-size:12px;color:#92400e;display:flex;align-items:center;gap:8px}
.body{padding:24px 28px}
.section{margin-bottom:20px}
.section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#6b7280;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e5e7eb}
table{width:100%;border-collapse:collapse}
.date{font-size:12px;color:#6b7280;margin-bottom:16px}
</style></head><body>
<div class="card">
  <div class="hdr">
    <h2>📄 PDF Template — Live Preview</h2>
    <p>${esc(form.companyName) || "Company"} · Offer Letter</p>
  </div>
  <div class="notice">
    ℹ️ Your PDF template is uploaded. The preview below reflects your form edits in real time. The final PDF will be used for Download &amp; Email.
  </div>
  <div class="body">
    <div class="date">Date: ${today}</div>

    <div class="section">
      <div class="section-title">Candidate Details</div>
      <table>
        ${row("Candidate Name", form.candidateName)}
        ${row("Candidate Email", form.candidateEmail)}
      </table>
    </div>

    <div class="section">
      <div class="section-title">Position Details</div>
      <table>
        ${row("Job Title / Position", form.position)}
        ${row("Grade", form.grade)}
        ${row("Department", form.department)}
        ${row("Location", form.location)}
        ${row("Date of Joining", form.joiningDate)}
        ${row("Offer Valid Until", form.offerValidUntil)}
        ${row("Probation Period", form.probationPeriod)}
        ${row("Notice Period", form.noticePeriod)}
      </table>
    </div>

    <div class="section">
      <div class="section-title">Salary Details</div>
      <table>
        ${row("Basic", form.basic)}
        ${row("HRA", form.hra)}
        ${row("Special Allowance", form.allowances)}
        ${row("Education Allowance", form.educationAllowance)}
        ${row("LTA", form.lta)}
        ${row("Gross Salary", form.grossSalary)}
        ${row("Meal Card", form.mealCard)}
        ${row("Provident Fund", form.pf)}
        ${row("GPA", form.gpa)}
        ${row("GLIC", form.glic)}
        ${row("Medi Claim", form.mediClaim)}
        ${row("Total SSB", form.totalSsb)}
        ${row("Gross Fixed CTC", form.grossFixedCtc)}
        ${row("Annual Variable Pay", form.variablePay)}
        ${row("Total CTC", form.ctc)}
      </table>
    </div>

    <div class="section">
      <div class="section-title">Company &amp; HR</div>
      <table>
        ${row("Company Name", form.companyName)}
        ${row("HR Signatory", form.hrName)}
        ${row("HR Designation", form.hrDesignation)}
      </table>
    </div>
  </div>
</div>
</body></html>`;
}

/* -----------------------------------------------------------
   MAIN COMPONENT
----------------------------------------------------------- */
export default function OfferLetterModal({ job, onClose }) {
  const [activeTab, setActiveTab] = useState("default");

  const [form, setForm] = useState({
    candidateName:      job?.candidateName  || "",
    candidateEmail:     job?.candidateEmail || "",
    position:           job?.jobTitle       || "",
    department:         job?.department     || "",
    location:           job?.location       || "",
    joiningDate:        job?.onboardingDate || "",
    grade:              "",                          // e.g. "Grade 4-B"
    // Salary breakdown (Hero FinCorp style)
    basic:              job?.basic          || "",
    hra:                job?.hra            || "",
    allowances:         job?.allowances     || "",   // Special Allowance
    educationAllowance: "",                          // Education Allowance
    lta:                "",                          // LTA
    grossSalary:        "",                          // Gross Salary (auto or manual)
    mealCard:           "",                          // Meal Card
    pf:                 "",                          // Provident Fund
    gpa:                "",                          // GPA
    glic:               "",                          // GLIC
    mediClaim:          "",                          // Medi Claim
    totalSsb:           "",                          // Total SSB
    grossFixedCtc:      "",                          // Gross Fixed CTC
    variablePay:        job?.bonus          || "",   // Annual Variable Pay
    ctc:                job?.ctc            || "",   // Total CTC
    // Terms
    probationPeriod:    "3 months",
    noticePeriod:       job?.noticePeriod   || "60 days",
    offerValidUntil:    "",
    // Company / HR
    companyName:        "OMOIKANE INNOVATIONS PVT LTD",
    hrName:             "HR Department",
    hrDesignation:      "Head - Talent Acquisition",
  });

  const [policies, setPolicies]           = useState({ ...DEFAULT_POLICIES });
  const setPolicy = (key, val)            => setPolicies(p => ({ ...p, [key]: val }));

  const [uploadedFile, setUploadedFile]   = useState(null);
  const [uploadedHTML, setUploadedHTML]   = useState("");
  const [pdfDataUrl, setPdfDataUrl]       = useState(null); // base64 data URL for PDF preview
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState(null); // raw bytes for pdf-lib processing
  const [pdfPageImages, setPdfPageImages] = useState([]); // rendered page images from PDF.js
  const [pdfRendering, setPdfRendering]   = useState(false); // loading state for PDF render
  const [isDragOver, setIsDragOver]       = useState(false);
  const fileInputRef                      = useRef(null);

  /* Signature */
  const canvasRef                         = useRef(null);
  const [isDrawing, setIsDrawing]         = useState(false);
  const [signatureDataUrl, setSigUrl]     = useState(null);
  const [sigStatus, setSigStatus]         = useState("pending");
  const lastPos                           = useRef({ x: 0, y: 0 });

  /* Preview */
  const [previewHTML, setPreviewHTML]     = useState("");
  const iframeRef                         = useRef(null);

  /* Status / loading */
  const [status, setStatus]               = useState(null);
  const [sending, setSending]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [savedLetters, setSavedLetters]   = useState([]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));


  /* Rebuild PDF preview — debounced so it doesn't fire on every keystroke */
  const pdfRenderTimer = useRef(null);
  const pdfRenderCancelRef = useRef(false);

  useEffect(() => {
    if (!(activeTab === "upload" && pdfArrayBuffer)) return;

    // Cancel any in-progress render
    pdfRenderCancelRef.current = true;

    // Debounce: wait 500ms after last keystroke before re-rendering
    clearTimeout(pdfRenderTimer.current);
    pdfRenderTimer.current = setTimeout(() => {
      pdfRenderCancelRef.current = false;
      setPdfRendering(true);

      // Always copy the buffer before passing to async functions
      // to avoid detached ArrayBuffer issues
      const bufferCopy = pdfArrayBuffer.slice(0);

      replacePlaceholdersInPdf(bufferCopy, form)
        .then(modifiedBytes => {
          if (pdfRenderCancelRef.current) return null;
          // modifiedBytes is Uint8Array — extract its own buffer slice
          const renderBuf = modifiedBytes.buffer.slice(
            modifiedBytes.byteOffset,
            modifiedBytes.byteOffset + modifiedBytes.byteLength
          );
          return renderPdfToImages(renderBuf);
        })
        .then(images => {
          if (pdfRenderCancelRef.current || !images) return;
          setPdfPageImages(images);
          setPdfRendering(false);
        })
        .catch(err => {
          console.error("PDF preview error:", err);
          if (pdfRenderCancelRef.current) return;
          // Fallback: render original PDF without replacements
          renderPdfToImages(pdfArrayBuffer.slice(0))
            .then(images => {
              if (!pdfRenderCancelRef.current) {
                setPdfPageImages(images || []);
                setPdfRendering(false);
              }
            })
            .catch(() => setPdfRendering(false));
        });
    }, 500);

    return () => {
      clearTimeout(pdfRenderTimer.current);
    };
  }, [form, activeTab, pdfArrayBuffer]);

  /* Rebuild HTML/default preview when form changes */
  useEffect(() => {
    if (activeTab === "upload" && pdfArrayBuffer) return; // handled by PDF effect above
    if (activeTab === "upload" && uploadedHTML) {
      setPreviewHTML(applyPlaceholders(uploadedHTML, form));
    } else {
      setPreviewHTML(buildDefaultHTML(form, policies, signatureDataUrl));
    }
  }, [form, policies, signatureDataUrl, activeTab, uploadedHTML, pdfArrayBuffer]);

  /* Drive the iframe — only for HTML/default previews */
  useEffect(() => {
    if (!iframeRef.current) return;
    if (activeTab === "upload" && pdfArrayBuffer) return; // PDF uses canvas images
    iframeRef.current.removeAttribute("src");
    iframeRef.current.srcdoc = previewHTML;
  }, [previewHTML, pdfArrayBuffer, activeTab]);

  /* -- Signature pad helpers -- */
  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width, sy = canvas.height / r.height;
    if (e.touches) return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy };
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  };
  const startDraw = (e) => { e.preventDefault(); setIsDrawing(true); lastPos.current = getPos(e, canvasRef.current); };
  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e, canvasRef.current);
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y); ctx.strokeStyle = "#1e3a5f"; ctx.lineWidth = 2.5;
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    lastPos.current = pos;
  };
  const stopDraw = () => setIsDrawing(false);
  const clearSig = () => {
    canvasRef.current?.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSigUrl(null); setSigStatus("pending");
  };
  const confirmSig = () => {
    const url = canvasRef.current?.toDataURL("image/png");
    setSigUrl(url); setSigStatus("signed");
    setStatus({ type: "success", msg: "Signature captured. Preview updated." });
    setTimeout(() => setActiveTab("default"), 700);
  };

  /* -- File upload -- */
  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.name.match(/\.(html|htm|txt|pdf|docx)$/i)) {
      setStatus({ type: "error", msg: "Please upload an HTML, TXT, PDF, or DOCX file." }); return;
    }
    // Clear previous state
    setPdfDataUrl(null);
    setPdfArrayBuffer(null);
    setPdfPageImages([]);
    setUploadedFile(file); setStatus(null);

    if (file.name.match(/\.(html|htm|txt)$/i)) {
      // HTML/TXT: read as text and render with placeholder substitution
      const r = new FileReader();
      r.onload = (e) => { setUploadedHTML(e.target.result); setActiveTab("upload"); };
      r.readAsText(file);
    } else if (file.name.match(/\.pdf$/i)) {
      // PDF: read as ArrayBuffer for pdf-lib + PDF.js processing
      const reader = new FileReader();
      reader.onload = (evt) => {
        const buffer = evt.target.result; // ArrayBuffer
        setPdfArrayBuffer(buffer);
        setUploadedHTML("");
        setActiveTab("upload");
        // Initial render — show the original PDF immediately
        setPdfRendering(true);
        renderPdfToImages(buffer.slice(0))
          .then(images => {
            setPdfPageImages(images || []);
            setPdfRendering(false);
          })
          .catch(() => setPdfRendering(false));
      };
      reader.readAsArrayBuffer(file);
    }
  }, [form]);

  /* -- Download -- */
  const handleDownload = async () => {
    // If a PDF template is uploaded, use pdf-lib to replace placeholders and download
    if (activeTab === "upload" && pdfArrayBuffer) {
      try {
        setStatus({ type: "success", msg: "Preparing PDF download..." });
        const modifiedBytes = await replacePlaceholdersInPdf(pdfArrayBuffer.slice(0), form);
        // modifiedBytes is Uint8Array — create blob directly from it
        const blob = new Blob([modifiedBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `OfferLetter_${(form.candidateName || "Candidate").replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStatus({ type: "success", msg: "PDF downloaded successfully." });
      } catch (err) {
        setStatus({ type: "error", msg: "PDF download failed: " + err.message });
      }
      return;
    }
    // HTML template or default letter — open print dialog
    const html = activeTab === "upload" && uploadedHTML
      ? applyPlaceholders(uploadedHTML, form)
      : buildDefaultHTML(form, policies, signatureDataUrl);
    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups."); return; }
    win.document.write(html); win.document.close(); win.focus();
    setTimeout(() => win.print(), 600);
  };

  /* -- Save -- */
  const handleSave = async () => {
    if (!form.candidateName) { setStatus({ type: "error", msg: "Candidate name is required." }); return; }
    setSaving(true); setStatus(null);
    try {
      const payload = { ...form, policies, signatureDataUrl, sigStatus,
        jobId: job?._id || job?.id || "", jobTitle: job?.jobTitle || form.position,
        templateType: activeTab === "upload" ? "custom" : "default",
        savedAt: new Date().toLocaleString() };
      const json = await saveOfferLetter(payload);
      if (json.status === "success") {
        setStatus({ type: "success", msg: `Offer letter saved for ${form.candidateName}` });
        setSavedLetters(p => [{ ...payload, id: json.id || Date.now() }, ...p]);
      } else { setStatus({ type: "error", msg: "Save failed: " + json.message }); }
    } catch {
      const local = { ...form, policies, sigStatus, id: Date.now(), savedAt: new Date().toLocaleString() };
      setSavedLetters(p => [local, ...p]);
      setStatus({ type: "success", msg: `Saved locally for ${form.candidateName}` });
    } finally { setSaving(false); }
  };

  /* -- Send -- */
  const handleSend = async () => {
    if (!form.candidateEmail) { setStatus({ type: "error", msg: "Candidate email is required." }); return; }
    if (!form.offerValidUntil) { setStatus({ type: "error", msg: "Please set the offer validity date." }); return; }
    setSending(true); setStatus(null);
    try {
      const json = await sendOfferLetter({ ...form, policies });
      if (json.status === "success") setStatus({ type: "success", msg: `Offer letter sent to ${form.candidateEmail}` });
      else setStatus({ type: "error", msg: "Send failed: " + json.message });
    } catch (err) { setStatus({ type: "error", msg: "Error: " + err.message }); }
    finally { setSending(false); }
  };

  const PLACEHOLDERS = ["{{candidateName}}","{{candidateEmail}}","{{position}}","{{department}}",
    "{{location}}","{{joiningDate}}","{{ctc}}","{{basic}}","{{hra}}","{{allowances}}",
    "{{bonus}}","{{probationPeriod}}","{{noticePeriod}}","{{offerValidUntil}}","{{companyName}}","{{today}}"];

  return (
    <div className="ol-backdrop" onClick={onClose}>
      <div className="ol-modal" onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div className="ol-header">
          <div className="ol-header-left">
            <h3>?? Offer Letter</h3>
            <p>{job?.jobTitle} � {job?.department}</p>
          </div>
          <div className="ol-header-badges">
            {sigStatus === "signed" && <span className="ol-sig-badge">? Digitally Signed</span>}
          </div>
          <button className="ol-close-btn" onClick={onClose}>?</button>
        </div>

        {/* TABS */}
        <div className="ol-tabs">
          <button className={`ol-tab ${activeTab === "default" ? "active" : ""}`} onClick={() => setActiveTab("default")}>?? Letter</button>
          <button className={`ol-tab ${activeTab === "upload" ? "active" : ""}`} onClick={() => setActiveTab("upload")}>?? Upload</button>
          <button className={`ol-tab ${activeTab === "policies" ? "active" : ""}`} onClick={() => setActiveTab("policies")}>?? Policies</button>
          <button className={`ol-tab ${activeTab === "signature" ? "active" : ""}`} onClick={() => setActiveTab("signature")}>
            ?? Signature {sigStatus === "signed" ? "?" : ""}
          </button>
          <button className={`ol-tab ${activeTab === "saved" ? "active" : ""}`} onClick={() => setActiveTab("saved")}>
            ?? Saved ({savedLetters.length})
          </button>
        </div>

        {/* BODY */}
        <div className="ol-body">
          <div className="ol-form-panel">
            {status && <div className={`ol-status ${status.type}`}>{status.msg}</div>}

            {activeTab === "saved" && (
              <>
                <p className="ol-section-title">Saved Offer Letters</p>
                {savedLetters.length === 0
                  ? <p style={{ color:"#9ca3af", fontSize:13, textAlign:"center", marginTop:40 }}>No saved letters yet.</p>
                  : <div className="ol-saved-list">
                      {savedLetters.map((s, i) => (
                        <div className="ol-saved-item" key={s.id || i}>
                          <div className="saved-info">
                            <div className="saved-name">{s.candidateName || "Unknown"}</div>
                            <div className="saved-meta">{s.position} � {s.department}</div>
                            <div className="saved-meta" style={{ color:"#9ca3af" }}>{s.savedAt}</div>
                            {s.sigStatus === "signed" && <div className="saved-meta" style={{ color:"#16a34a", fontWeight:700 }}>? Digitally Signed</div>}
                          </div>
                          <div className="saved-actions">
                            <button style={{ background:"#eff6ff", color:"#2563eb" }}
                              onClick={() => { setForm({...s}); if(s.policies) setPolicies(s.policies); setActiveTab("default"); }}>Edit</button>
                            <button style={{ background:"#f0fdf4", color:"#16a34a" }}
                              onClick={() => { setForm({...s}); if(s.policies) setPolicies(s.policies); setTimeout(handleDownload,100); }}>PDF</button>
                          </div>
                        </div>
                      ))}
                    </div>
                }
              </>
            )}

            {activeTab === "upload" && (
              <>
                {!uploadedFile
                  ? <div className={`ol-upload-zone ${isDragOver ? "drag-over" : ""}`}
                      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => fileInputRef.current?.click()}>
                      <div className="upload-icon">??</div>
                      <p>Drag &amp; drop your template here</p>
                      <span>Supports .html, .txt, .pdf, .docx</span>
                      <input ref={fileInputRef} type="file" accept=".html,.htm,.txt,.pdf,.docx"
                        onChange={e => handleFile(e.target.files[0])} />
                    </div>
                  : <div className="ol-file-badge">
                      <span className="file-icon">??</span>
                      <div className="file-info">
                        <div className="file-name">{uploadedFile.name}</div>
                        <div className="file-size">{(uploadedFile.size/1024).toFixed(1)} KB</div>
                      </div>
                      <button className="remove-btn" onClick={() => { setPdfDataUrl(null); setPdfArrayBuffer(null); setPdfPageImages([]); setUploadedFile(null); setUploadedHTML(""); }}>✕</button>
                    </div>
                }
                <div className="ol-placeholder-info">
                  <p>Use these placeholders in your template &mdash; they will be auto-filled:</p>
                  <div className="tags">
                    {PLACEHOLDERS.map(p => (
                      <span key={p} className="tag" title="Click to copy" onClick={() => navigator.clipboard?.writeText(p)}>{p}</span>
                    ))}
                  </div>
                  {pdfArrayBuffer && (
                    <div style={{ marginTop:10, padding:"8px 12px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:6, fontSize:12, color:"#166534" }}>
                      ✅ PDF template loaded. Edit the form fields — the preview updates automatically with your changes.
                      Make sure your PDF uses <code>{"{{placeholders}}"}</code> like <code>{"{{candidateName}}"}</code> for live substitution.
                    </div>
                  )}
                </div>
                <FormFields form={form} set={set} />
              </>
            )}

            {activeTab === "policies" && <PoliciesPanel policies={policies} setPolicy={setPolicy} />}

            {activeTab === "signature" && (
              <SignaturePad
                canvasRef={canvasRef} isDrawing={isDrawing} signatureDataUrl={signatureDataUrl}
                sigStatus={sigStatus} startDraw={startDraw} draw={draw} stopDraw={stopDraw}
                clearSig={clearSig} confirmSig={confirmSig} candidateName={form.candidateName}
              />
            )}

            {activeTab === "default" && <FormFields form={form} set={set} />}
          </div>

          {/* PREVIEW PANEL */}
          <div className="ol-preview-panel">
            <div className="ol-preview-label">
              {activeTab === "upload" && pdfArrayBuffer ? "📄 PDF Template Preview" : "👁 Live Preview"}
              <span style={{ marginLeft:"auto", fontSize:11, color:"#9ca3af" }}>
                {activeTab === "upload" && pdfArrayBuffer ? "Updates as you type" : "Updates as you type"}
              </span>
            </div>
            <div className="ol-preview-frame" style={{ position:"relative", overflow:"auto" }}>
              {activeTab === "upload" && pdfArrayBuffer ? (
                /* PDF uploaded: render pages as canvas images via PDF.js with placeholders replaced */
                pdfRendering ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:12, color:"#6b7280" }}>
                    <div style={{ fontSize:32 }}>⏳</div>
                    <p style={{ fontSize:13, fontWeight:600 }}>Rendering PDF preview...</p>
                    <p style={{ fontSize:12 }}>Applying your form values to the template</p>
                  </div>
                ) : pdfPageImages.length > 0 ? (
                  <div style={{ padding:"12px", background:"#f1f5f9", minHeight:"100%" }}>
                    {pdfPageImages.map((imgSrc, idx) => (
                      <img
                        key={idx}
                        src={imgSrc}
                        alt={`Page ${idx + 1}`}
                        style={{ width:"100%", display:"block", marginBottom: idx < pdfPageImages.length - 1 ? 12 : 0, boxShadow:"0 2px 8px rgba(0,0,0,0.15)", borderRadius:4 }}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:12, color:"#6b7280" }}>
                    <div style={{ fontSize:48 }}>📄</div>
                    <p style={{ fontSize:13, fontWeight:600 }}>PDF preview will appear here</p>
                  </div>
                )
              ) : (
                /* HTML template or default letter: live iframe with placeholder substitution */
                <iframe
                  ref={iframeRef}
                  title="Offer Letter Preview"
                  sandbox="allow-same-origin"
                  style={{ width:"100%", height:"100%", border:"none" }}
                />
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="ol-footer">
          <button className="ol-btn ol-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="ol-btn ol-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? "? Saving..." : "?? Save"}
          </button>
          <button className="ol-btn ol-btn-download" onClick={handleDownload}>? Download PDF</button>
          <button className="ol-btn ol-btn-send" onClick={handleSend} disabled={sending}>
            {sending ? "? Sending..." : "?? Send via Email"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   FormFields � Hero FinCorp style salary structure
----------------------------------------------------------- */
function FormFields({ form, set }) {
  return (
    <>
      <p className="ol-section-title">Candidate Details</p>
      <div className="ol-grid">
        <div className="ol-field">
          <label>Candidate Name *</label>
          <input type="text" placeholder="e.g. Mahesh Panchal" value={form.candidateName} onChange={e => set("candidateName", e.target.value)} />
        </div>
        <div className="ol-field">
          <label>Candidate Email *</label>
          <input type="email" placeholder="e.g. mahesh@gmail.com" value={form.candidateEmail} onChange={e => set("candidateEmail", e.target.value)} />
        </div>
      </div>

      <p className="ol-section-title">Position Details</p>
      <div className="ol-grid">
        <div className="ol-field">
          <label>Job Title / Position</label>
          <input type="text" placeholder="e.g. Collection Manager - UBL" value={form.position} onChange={e => set("position", e.target.value)} />
        </div>
        <div className="ol-field">
          <label>Grade</label>
          <input type="text" placeholder="e.g. Grade 4-B" value={form.grade || ""} onChange={e => set("grade", e.target.value)} />
        </div>
        <div className="ol-field">
          <label>Department</label>
          <input type="text" value={form.department} onChange={e => set("department", e.target.value)} />
        </div>
        <div className="ol-field">
          <label>Location</label>
          <input type="text" placeholder="e.g. Bangalore" value={form.location} onChange={e => set("location", e.target.value)} />
        </div>
        <div className="ol-field">
          <label>Date of Joining</label>
          <input type="date" value={form.joiningDate} onChange={e => set("joiningDate", e.target.value)} />
        </div>
        <div className="ol-field">
          <label>Offer Valid Until *</label>
          <input type="date" value={form.offerValidUntil} onChange={e => set("offerValidUntil", e.target.value)} />
        </div>
      </div>

      <p className="ol-section-title">Salary Computation (Annual)</p>
      <div className="ol-salary-hint">Enter annual amounts � monthly is auto-calculated in the letter.</div>
      <div className="ol-grid">
        <div className="ol-field"><label>Basic</label>
          <input type="text" placeholder="e.g. 2,47,520" value={form.basic} onChange={e => set("basic", e.target.value)} /></div>
        <div className="ol-field"><label>HRA</label>
          <input type="text" placeholder="e.g. 1,23,760" value={form.hra} onChange={e => set("hra", e.target.value)} /></div>
        <div className="ol-field"><label>Special Allowance</label>
          <input type="text" placeholder="e.g. 1,56,644" value={form.allowances} onChange={e => set("allowances", e.target.value)} /></div>
        <div className="ol-field"><label>Education Allowance</label>
          <input type="text" placeholder="e.g. 2,400" value={form.educationAllowance || ""} onChange={e => set("educationAllowance", e.target.value)} /></div>
        <div className="ol-field"><label>LTA</label>
          <input type="text" placeholder="e.g. 24,000" value={form.lta || ""} onChange={e => set("lta", e.target.value)} /></div>
        <div className="ol-field"><label>Gross Salary</label>
          <input type="text" placeholder="e.g. 5,54,328" value={form.grossSalary || ""} onChange={e => set("grossSalary", e.target.value)} /></div>
      </div>

      <p className="ol-section-title" style={{ marginTop: 12 }}>Benefits / SSB</p>
      <div className="ol-grid">
        <div className="ol-field"><label>Meal Card</label>
          <input type="text" placeholder="e.g. 15,000" value={form.mealCard || ""} onChange={e => set("mealCard", e.target.value)} /></div>
        <div className="ol-field"><label>Provident Fund</label>
          <input type="text" placeholder="e.g. 29,700" value={form.pf || ""} onChange={e => set("pf", e.target.value)} /></div>
        <div className="ol-field"><label>GPA</label>
          <input type="text" placeholder="e.g. 840" value={form.gpa || ""} onChange={e => set("gpa", e.target.value)} /></div>
        <div className="ol-field"><label>GLIC</label>
          <input type="text" placeholder="e.g. 2,520" value={form.glic || ""} onChange={e => set("glic", e.target.value)} /></div>
        <div className="ol-field"><label>Medi Claim</label>
          <input type="text" placeholder="e.g. 16,416" value={form.mediClaim || ""} onChange={e => set("mediClaim", e.target.value)} /></div>
        <div className="ol-field"><label>Total SSB</label>
          <input type="text" placeholder="e.g. 19,776" value={form.totalSsb || ""} onChange={e => set("totalSsb", e.target.value)} /></div>
        <div className="ol-field"><label>Gross Fixed CTC</label>
          <input type="text" placeholder="e.g. 6,18,804" value={form.grossFixedCtc || ""} onChange={e => set("grossFixedCtc", e.target.value)} /></div>
        <div className="ol-field"><label>Annual Variable Pay</label>
          <input type="text" placeholder="e.g. 61,200" value={form.variablePay || ""} onChange={e => set("variablePay", e.target.value)} /></div>
        <div className="ol-field span2"><label>Total CTC (Cost to Company) *</label>
          <input type="text" placeholder="e.g. 6,80,004" value={form.ctc} onChange={e => set("ctc", e.target.value)} /></div>
      </div>

      <p className="ol-section-title">Terms</p>
      <div className="ol-grid">
        <div className="ol-field">
          <label>Probation Period</label>
          <select value={form.probationPeriod} onChange={e => set("probationPeriod", e.target.value)}>
            <option>3 months</option><option>6 months</option><option>1 year</option><option>No probation</option>
          </select>
        </div>
        <div className="ol-field">
          <label>Notice Period</label>
          <select value={form.noticePeriod} onChange={e => set("noticePeriod", e.target.value)}>
            <option>Immediate Joining</option><option>15 days</option><option>30 days</option><option>60 days</option><option>90 days</option>
          </select>
        </div>
      </div>

      <p className="ol-section-title">Company & HR Details</p>
      <div className="ol-grid">
        <div className="ol-field span2"><label>Company Name</label>
          <input type="text" value={form.companyName} onChange={e => set("companyName", e.target.value)} /></div>
        <div className="ol-field"><label>HR Signatory Name</label>
          <input type="text" placeholder="e.g. Sanjay Khan" value={form.hrName || ""} onChange={e => set("hrName", e.target.value)} /></div>
        <div className="ol-field"><label>HR Designation</label>
          <input type="text" placeholder="e.g. Head - Talent Acquisition" value={form.hrDesignation || ""} onChange={e => set("hrDesignation", e.target.value)} /></div>
      </div>
    </>
  );
}

/* -----------------------------------------------------------
   PoliciesPanel � admin edits each policy section
----------------------------------------------------------- */
function PoliciesPanel({ policies, setPolicy }) {
  const sections = [
    { key: "rulesRegulations", label: "Rules & Regulations",  icon: "??", color: "#dc2626" },
    { key: "companyPolicies",  label: "Company Policies",     icon: "??", color: "#2563eb" },
    { key: "leavePolicies",    label: "Leave Policies",       icon: "??", color: "#16a34a" },
    { key: "holidayPolicies",  label: "Holiday Policies",     icon: "??", color: "#d97706" },
    { key: "securityPolicies", label: "Security Policies",    icon: "??", color: "#7c3aed" },
  ];

  return (
    <div className="pol-panel">
      <div className="pol-panel-header">
        <h4>Company Policies</h4>
        <p>Edit the policy content below. Changes will appear in the offer letter preview automatically.</p>
      </div>
      {sections.map(s => (
        <div className="pol-editor-block" key={s.key}>
          <div className="pol-editor-label" style={{ borderLeftColor: s.color }}>
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </div>
          <textarea
            className="pol-editor-textarea"
            value={policies[s.key]}
            onChange={e => setPolicy(s.key, e.target.value)}
            rows={5}
            placeholder={`Enter ${s.label} content...`}
          />
        </div>
      ))}
    </div>
  );
}

/* -----------------------------------------------------------
   SignaturePad � canvas-based digital signature
----------------------------------------------------------- */
function SignaturePad({ canvasRef, isDrawing, signatureDataUrl, sigStatus,
  startDraw, draw, stopDraw, clearSig, confirmSig, candidateName }) {
  return (
    <div className="sig-panel">
      <div className="sig-panel-header">
        <h4>?? Digital Signature</h4>
        <p>
          {sigStatus === "signed"
            ? "Signature captured. It will appear in the offer letter."
            : `Draw the signature for ${candidateName || "the candidate"} below using mouse or touch.`}
        </p>
      </div>

      {sigStatus === "signed" ? (
        <div className="sig-confirmed">
          <div className="sig-confirmed-icon">?</div>
          <div className="sig-confirmed-text">Signature Confirmed</div>
          <div className="sig-confirmed-sub">Signed on {new Date().toLocaleString("en-IN")}</div>
          <img src={signatureDataUrl} alt="Captured signature" className="sig-preview-img" />
          <button className="sig-redo-btn" onClick={clearSig}>? Redo Signature</button>
        </div>
      ) : (
        <>
          <div className="sig-info-box">
            <span>??</span>
            <span>Draw the candidate's signature in the box below. This will be embedded in the offer letter PDF.</span>
          </div>
          <div className="sig-canvas-wrap">
            <canvas
              ref={canvasRef}
              width={360}
              height={160}
              className={`sig-canvas ${isDrawing ? "drawing" : ""}`}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            <div className="sig-canvas-hint">Sign here</div>
          </div>
          <div className="sig-actions">
            <button className="sig-clear-btn" onClick={clearSig}>?? Clear</button>
            <button className="sig-confirm-btn" onClick={confirmSig}>? Confirm Signature</button>
          </div>
        </>
      )}
    </div>
  );
}

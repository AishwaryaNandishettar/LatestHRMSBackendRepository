import api from "./axios";

// =====================
// JOB APIs
// =====================

// Get all jobs
export const getAllJobs = async () => {
  const res = await api.get("/api/jobs/all");
  return res.data;
};

// Create new job
export const createJob = async (data) => {
  const res = await api.post("/api/jobs/create", data);
  return res.data;
};

// Update full job (status + level + dates)
export const updateJob = async (id, data) => {
  const res = await api.put(`/api/jobs/update/${id}`, data);
  return res.data;
};

// Update ONLY status
export const updateJobStatus = async (id, status) => {
  const res = await api.put(`/api/jobs/status/${id}?status=${status}`);
  return res.data;
};

// Delete job
export const deleteJob = async (id) => {
  const res = await api.delete(`/api/jobs/${id}`);
  return res.data;
};

// Get single job
export const getJobById = async (id) => {
  const res = await api.get(`/api/jobs/${id}`);
  return res.data;
};

// =====================
// OFFER LETTER APIs
// =====================

// Send offer letter via email
export const sendOfferLetter = async (data) => {
  const res = await api.post("/api/offer-letter/send", data);
  return res.data;
};

// Send generated offer letter email
export const sendOfferLetterEmail = async (formData) => {
  const res = await api.post(
    "/api/offer-templates/send-offer-letter",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};
// Save offer letter to DB
export const saveOfferLetter = async (data) => {
  const res = await api.post("/api/offer-letter/save", data);
  return res.data;
};

// Get all saved offer letters
export const getAllOfferLetters = async () => {
  const res = await api.get("/api/offer-letter/all");
  return res.data;
};

// =====================
// OFFER LETTER TEMPLATE APIs
// =====================

// Upload new template
export const uploadOfferTemplate = async (formData) => {
  const res = await api.post("/api/offer-templates-simple/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Get all templates
export const getAllTemplates = async () => {
  const res = await api.get("/api/offer-templates-simple/all");
  return res.data;
};

// Get templates by company
export const getTemplatesByCompany = async (companyName) => {
  const res = await api.get(`/api/offer-templates-simple/company/${companyName}`);
  return res.data;
};

// Get template preview (base64)
export const getTemplatePreview = async (id) => {
  const res = await api.get(`/api/offer-templates-simple/preview/${id}`);
  return res.data;
};

// Download template
export const downloadTemplate = async (id) => {
  const res = await api.get(`/api/offer-templates-simple/download/${id}`, {
    responseType: "blob",
  });
  return res.data;
};

// Delete template
export const deleteTemplate = async (id) => {
  const res = await api.delete(`/api/offer-templates-simple/${id}`);
  return res.data;
};

// Toggle template active status
export const toggleTemplateStatus = async (id) => {
  const res = await api.put(`/api/offer-templates-simple/toggle/${id}`);
  return res.data;
};
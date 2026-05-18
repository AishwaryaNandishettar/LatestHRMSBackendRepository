import axios from "axios";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/insurance`;

export const getClaims = async () => {
  const res = await axios.get(`${API}/all`);
  return res.data;
};

export const createClaim = async (claim) => {
  const res = await axios.post(`${API}/create`, claim);
  return res.data;
};

export const updateClaimStatus = async (id, status) => {
  const res = await axios.put(`${API}/status/${id}?status=${status}`);
  return res.data;
};

export const updateApprovedAmount = async (id, amount) => {
  const res = await axios.put(`${API}/amount/${id}?amount=${amount}`);
  return res.data;
};
export const getInsurancePlans = async (companyId) => {
  const res = await axios.get(`${API}/plans/${companyId}`);
  return res.data;
};
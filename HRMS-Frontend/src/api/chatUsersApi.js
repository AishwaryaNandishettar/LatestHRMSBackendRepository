import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchChatUsers = async (token) => {
  if (!token) throw new Error("JWT token missing");
  const res = await axios.get(`${BASE_URL}/api/chat/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

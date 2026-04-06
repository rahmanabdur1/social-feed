import axios from "axios";
import api, { setAccessToken } from "./axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const login = async (email: string, password: string) => {
  const res = await axios.post(
    `${BASE_URL}/auth/login`,
    { email, password },
    { withCredentials: true }
  );
  setAccessToken(res.data.access_token);
  return res.data;
};

export const register = async (data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}) => {
  const res = await axios.post(
    `${BASE_URL}/auth/register`,
    data,
    { withCredentials: true }
  );
  return res.data;
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch {
   
  }
  setAccessToken("");
  window.location.href = "/login";
};

export const initAuth = async (): Promise<boolean> => {
  try {
    const res = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      {
        withCredentials: true,
  
      }
    );
    if (res.data?.access_token) {
      setAccessToken(res.data.access_token);
      return true;
    }
    return false;
  } catch {

    setAccessToken("");
    return false;
  }
};
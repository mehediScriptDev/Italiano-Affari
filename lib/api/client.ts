import axios from "axios";

export const API_URL = "https://api.psicopatici.com/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default api;

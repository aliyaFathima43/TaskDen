import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("todo_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function registerUser(payload) {
  return api.post("/auth/register", payload);
}

export function loginUser(payload) {
  return api.post("/auth/login", payload);
}

export function getTasks() {
  return api.get("/tasks");
}

export function addTask(payload) {
  return api.post("/tasks", payload);
}

export function updateTask(id, payload) {
  return api.put(`/tasks/${id}`, payload);
}

export function deleteTask(id) {
  return api.delete(`/tasks/${id}`);
}

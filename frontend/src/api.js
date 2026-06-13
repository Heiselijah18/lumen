// Base URL of the deployed backend. Set VITE_API_URL in your frontend's
// environment (e.g. on Vercel) to your Render backend URL, such as
// https://lumen-backend.onrender.com
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("lumen_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("lumen_token", token);
  else localStorage.removeItem("lumen_token");
}

async function request(path, { method = "GET", body, auth = true, form = false } = {}) {
  const headers = {};
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let payload = body;
  if (body && !form) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  signup: (name, email, password, role) =>
    request("/signup", { method: "POST", body: { name, email, password, role }, auth: false }),

  login: async (email, password) => {
    const body = new URLSearchParams({ username: email, password });
    const data = await request("/login", { method: "POST", body, auth: false, form: true });
    setToken(data.access_token);
    return data;
  },

  logout: () => setToken(null),

  me: () => request("/me"),

  // Mood
  logMood: (value) => request("/mood", { method: "POST", body: { value } }),
  getMoods: () => request("/mood"),

  // Chat
  getChatHistory: () => request("/chat"),
  sendChat: (message) => request("/chat", { method: "POST", body: { message } }),

  // Subscription
  getSubscription: () => request("/subscription"),
  setSubscription: (plan) => request("/subscription", { method: "POST", body: { plan } }),

  // Therapist
  getClients: () => request("/therapist/clients"),
  claimClient: (clientId) => request(`/therapist/claim/${clientId}`, { method: "POST" }),
  getTherapistProfile: () => request("/therapist/profile"),
};

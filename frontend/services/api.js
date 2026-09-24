import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function registerUser(name, email, password) {
  const { data } = await client.post("/auth/register", { name, email, password });
  return data;
}

export async function loginUser(email, password) {
  const { data } = await client.post("/auth/login", { email, password });
  return data;
}

export async function sendChatMessage(sessionId, message, language = "en") {
  const { data } = await client.post("/chat", { session_id: sessionId, message, language });
  return data;
}

export async function fetchHistory(sessionId) {
  const { data } = await client.get(`/chat/history/${sessionId}`);
  return data;
}

export async function submitFeedback(sessionId, rating, comment) {
  const { data } = await client.post("/analytics/feedback", { session_id: sessionId, rating, comment });
  return data;
}

export async function fetchSessions() {
  const { data } = await client.get("/chat/sessions");
  return data;
}

export async function streamChatMessage(sessionId, message, onChunk, onDone, onMeta, onSuggestions, onSources, onConfidence, onSentiment, onEscalated) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ session_id: sessionId, message }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = JSON.parse(line.slice(6));
      if (data.type === "meta" && onMeta) onMeta(data);
      if (data.type === "chunk") onChunk(data.text);
      if (data.type === "sources" && onSources) onSources(data.items);  
      if (data.type === "suggestions" && onSuggestions) onSuggestions(data.items);
      if (data.type === "confidence" && onConfidence) onConfidence(data.level);
      if (data.type === "sentiment" && onSentiment) onSentiment(data.level);
      if (data.type === "escalated" && onEscalated) onEscalated(data.ticket_id);
    }
  }
}

export async function uploadFile(file) {
  const token = localStorage.getItem("access_token");
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/chat/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return response.json();
}


export async function submitReaction(sessionId, messageIndex, reaction) {
  const { data } = await client.post("/analytics/reaction", { session_id: sessionId, message_index: messageIndex, reaction });
  return data;
}

export async function deleteSession(sessionId) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}


export async function getTicketStatus(ticketId) {
  const { data } = await client.get(`/chat/ticket/${ticketId}`);
  return data;
}

export async function updateTicketStatus(ticketId, status) {
  const { data } = await client.patch(`/admin/tickets/${ticketId}/status`, { status });
  return data;
}


export async function getMe() {
  const { data } = await client.get("/auth/me");
  return data;
}

export async function updateMe(name) {
  const { data } = await client.patch("/auth/me", { name });
  return data;
}


export async function forgotPassword(email) {
  const { data } = await client.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(token, newPassword) {
  const { data } = await client.post("/auth/reset-password", { token, new_password: newPassword });
  return data;
}


export async function toggleSessionPin(sessionId) {
  const { data } = await client.post(`/chat/sessions/${sessionId}/pin`);
  return data;
}

export async function updateSessionTag(sessionId, tag) {
  const { data } = await client.post(`/chat/sessions/${sessionId}/tag`, { tag });
  return data;
}


export async function getSessionSummary(sessionId) {
  const { data } = await client.get(`/chat/sessions/${sessionId}/summary`);
  return data;
}


export async function getCannedResponses() {
  const { data } = await client.get("/admin/canned-responses");
  return data;
}

export async function createCannedResponse(title, content) {
  const { data } = await client.post("/admin/canned-responses", { title, content });
  return data;
}

export async function deleteCannedResponse(id) {
  const { data } = await client.delete(`/admin/canned-responses/${id}`);
  return data;
}


export async function getAuditLog() {
  const { data } = await client.get("/admin/audit-log");
  return data;
}

export async function getKbGaps() {
  const { data } = await client.get("/admin/kb-gaps");
  return data;
}


export async function getCustomerHealth() {
  const { data } = await client.get("/admin/customer-health");
  return data;
}


export async function pingPresence() {
  const { data } = await client.post("/admin/presence/ping");
  return data;
}

export async function getOnlineAdmins() {
  const { data } = await client.get("/admin/presence/online");
  return data;
}


export async function getAbTestResults() {
  const { data } = await client.get("/admin/ab-test-results");
  return data;
}

export default client;

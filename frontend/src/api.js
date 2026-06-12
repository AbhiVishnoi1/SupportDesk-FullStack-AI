const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.error || data.message || message;
    } catch (_err) {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  getHealth: () => request("/health"),
  getTickets: () => request("/tickets"),
  createTicket: (payload) => request("/tickets", { method: "POST", body: JSON.stringify(payload) }),
  updateTicketStatus: (id, status) => request(`/tickets/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  getProducts: () => request("/products"),
  getFaqs: () => request("/faqs"),
  createFaq: (payload) => request("/faqs", { method: "POST", body: JSON.stringify(payload) }),
  getFeedback: () => request("/feedback"),
  createFeedback: (payload) => request("/feedback", { method: "POST", body: JSON.stringify(payload) }),
  getChatHistory: () => request("/chatbot/history"),
  sendChatMessage: (message) => request("/chatbot", { method: "POST", body: JSON.stringify({ message }) }),
  getServiceCenters: () => request("/servicecenters"),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) })
};

export { API_BASE_URL };


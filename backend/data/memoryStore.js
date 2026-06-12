const store = {
  users: [],
  tickets: [],
  faqs: [
    {
      id: "faq-1",
      question: "How do I raise a ticket?",
      answer: "Open Submit Ticket, complete the form, confirm the summary, and submit it.",
      category: "Tickets",
      featured: true,
      createdAt: new Date().toISOString(),
    },
  ],
  feedback: [],
  products: [
    { id: "brand-1", name: "Lenovo", category: "Brand", available: "Yes", testing: "Support ready" },
    { id: "brand-2", name: "Dell", category: "Brand", available: "Yes", testing: "Support ready" },
    { id: "brand-3", name: "HP", category: "Brand", available: "Yes", testing: "Support ready" },
  ],
  chats: [],
};

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

module.exports = { store, createId };

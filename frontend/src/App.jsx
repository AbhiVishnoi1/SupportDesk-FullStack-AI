
import { useEffect, useMemo, useState } from "react";
import "./SupportDesk.css";
import { api } from "./api";

const NAV_ITEMS = [
  { label: "Dashboard" },
  { label: "Submit Ticket" },
  { label: "My Tickets" },
  { label: "Chat Support" },
  { label: "FAQ" },
  { label: "What's New" },
];

const ELECTRONICS_BRANDS = [
  "Lenovo",
  "Dell",
  "HP",
  "Asus",
  "Acer",
  "Apple",
  "Samsung",
  "Sony",
  "LG",
  "Xiaomi",
  "OnePlus",
];

const CHAT_SUGGESTIONS = [
  "How do I track my submitted ticket?",
  "My laptop is not turning on. What should I do?",
  "How can I check warranty support?",
  "Where is the nearest service center?",
];

const CATEGORY_GROUPS = [
  { title: "1. Device Not Working", items: ["Not turning on", "Dead device", "Hardware failure"] },
  { title: "2. Technical / Software Issue", items: ["App crash", "System bug", "Update issue"] },
  { title: "3. Battery / Charging Issue", items: ["Battery draining fast", "Not charging", "Overheating"] },
  { title: "4. Display / Screen Issue", items: ["Screen cracked", "No display", "Flickering"] },
  { title: "5. Audio / Sound Issue", items: ["No sound", "Low volume", "Speaker problem"] },
  { title: "6. Connectivity Issue", items: ["WiFi not working", "Bluetooth issue", "Network problem"] },
  { title: "7. Payment / Warranty Issue", items: ["Warranty claim", "Refund issue", "Billing problem"] },
  { title: "8. Delivery / Product Issue", items: ["Damaged product", "Wrong item", "Missing parts"] },
  { title: "9. Other / General Issue", items: ["Anything else", "Feedback"] },
];

const INITIAL_TICKET_FORM = {
  category: [],
  product: "",
  productImage: "",
  productName: "",
  modelNumber: "",
  purchaseDate: "",
  warrantyStatus: "Active",
  issueTitle: "",
  description: "",
  location: "",
};

const INITIAL_AUTH_FORM = { name: "", email: "", password: "" };
const INITIAL_FEEDBACK_FORM = { name: "", email: "", rating: 5, ticketId: "", message: "" };
const DEFAULT_CATEGORY = "9. Other / General Issue";

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getTicketStatus(ticket) {
  return ticket?.status || "Open";
}

function getTicketPriority(ticket) {
  return ticket?.priority || "Medium";
}

function getInitials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "SU";
}

function resolveCategory(issueTitle, category) {
  if (Array.isArray(category) && category.length) return category.join(", ");
  if (typeof category === "string" && category.trim()) return category;

  const normalizedIssues = issueTitle
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const matchedGroups = CATEGORY_GROUPS
    .filter((group) => group.items.some((item) => normalizedIssues.includes(item.toLowerCase())))
    .map((group) => group.title);

  return matchedGroups.length ? matchedGroups.join(", ") : DEFAULT_CATEGORY;
}

function UserAvatar({ className = "", title = "Your profile" }) {
  return (
    <div className={className} title={title} aria-label={title}>
      <span className="sd-avatar-glyph" aria-hidden="true" />
    </div>
  );
}

function ProfilePanel({ currentUser, onClose, onLogout }) {
  if (!currentUser) return null;

  return (
    <div className="sd-profile-overlay" onClick={onClose} role="presentation">
      <div className="sd-profile-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Profile information">
        <div className="sd-profile-head">
          <div>
            <h3>Profile Info</h3>
            <p>Your current support account details</p>
          </div>
          <button className="sd-auth-close" onClick={onClose} type="button" aria-label="Close profile panel">×</button>
        </div>
        <div className="sd-user-summary">
          <UserAvatar className="sd-avatar large" title="Profile" />
          <div>
            <strong>{currentUser.name || "Support User"}</strong>
            <p>{currentUser.email}</p>
            <p>{currentUser.role || "customer"}</p>
          </div>
        </div>
        <div className="sd-profile-actions">
          <button className="sd-secondary-btn" onClick={onClose} type="button">Close</button>
          <button className="sd-login-btn sd-logout-btn" onClick={onLogout} type="button">Logout</button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, text }) {
  return <div className="sd-empty-state"><h3>{title}</h3><p>{text}</p></div>;
}

function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="sd-error-banner">
      <div>
        <strong>Some backend data could not load.</strong>
        <p>{message}</p>
      </div>
      <button className="sd-secondary-btn" onClick={onRetry} type="button">Retry</button>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return <div className="sd-page-header"><div><h2 className="sd-page-title">{title}</h2>{subtitle ? <p className="sd-page-subtitle">{subtitle}</p> : null}</div>{action}</div>;
}

function SubmitTicket({ form, setForm, onSubmit, submitState, currentUser }) {
  const [summaryConfirmed, setSummaryConfirmed] = useState(false);
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const selectedIssues = form.issueTitle.split(",").map((item) => item.trim()).filter(Boolean);
  const selectedCategories = Array.isArray(form.category) ? form.category : form.category ? [form.category] : [];
  const handleIssueSelect = (groupTitle, item) => setForm((prev) => {
    const previousIssues = prev.issueTitle.split(",").map((entry) => entry.trim()).filter(Boolean);
    const previousCategories = Array.isArray(prev.category) ? prev.category : prev.category ? [prev.category] : [];
    const issueExists = previousIssues.includes(item);
    const nextIssues = issueExists ? previousIssues.filter((entry) => entry !== item) : [...previousIssues, item];

    const groupHasSelectedIssue = nextIssues.some((entry) => CATEGORY_GROUPS.find((group) => group.title === groupTitle)?.items.includes(entry));
    const nextCategories = issueExists
      ? (groupHasSelectedIssue ? previousCategories : previousCategories.filter((entry) => entry !== groupTitle))
      : Array.from(new Set([...previousCategories, groupTitle]));

    return {
      ...prev,
      category: nextCategories,
      issueTitle: nextIssues.join(", ")
    };
  });
  const handleProductImage = (e) => {
    const file = e.target.files?.[0];
    setForm((prev) => ({ ...prev, productImage: file ? file.name : "" }));
  };
  const hasRequiredDetails = Boolean(
    form.product &&
    form.productName.trim() &&
    form.modelNumber.trim() &&
    form.issueTitle.trim() &&
    form.description.trim() &&
    form.location.trim()
  );

  useEffect(() => {
    setSummaryConfirmed(false);
  }, [
    JSON.stringify(form.category),
    form.product,
    form.productImage,
    form.productName,
    form.modelNumber,
    form.purchaseDate,
    form.warrantyStatus,
    form.issueTitle,
    form.description,
    form.location
  ]);

  return (
    <div className="submit-container">
      <SectionHeader title="Submit Ticket" subtitle="Capture every product issue once and send it straight to the MongoDB-backed queue." />
      <form className="ticket-form" onSubmit={onSubmit}>
        <div className="ticket-layout">
          <div className="ticket-left-col">
            <section className="submit-section">
              <h3 className="section-title">Category Selection</h3>
              <div className="category-stack">
                {CATEGORY_GROUPS.map((group) => (
                  <div className="category-group" key={group.title}>
                    <h4 className="category-group-title">{group.title}</h4>
                    <div className="category-options">
                      {group.items.map((item) => (
                        <button key={`${group.title}-${item}`} type="button" className={`category-option${selectedIssues.includes(item) ? " active" : ""}`} onClick={() => handleIssueSelect(group.title, item)}>{item}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="ticket-right-col">
            <section className="submit-section product-section">
              <div className="form-group">
                <label>Brand Selection</label>
                <select name="product" value={form.product} onChange={handleChange} required>
                  <option value="">Select brand</option>
                  {ELECTRONICS_BRANDS.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Product Image</label><input type="file" accept="image/*" onChange={handleProductImage} /></div>
              <div className="form-group"><label>Product Name</label><input type="text" name="productName" value={form.productName} placeholder="Enter product name" onChange={handleChange} required /></div>
              <div className="form-group"><label>Model Number</label><input type="text" name="modelNumber" value={form.modelNumber} placeholder="Enter model number" onChange={handleChange} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Purchase Date</label><input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} /></div>
                <div className="form-group"><label>Warranty Status</label><select name="warrantyStatus" value={form.warrantyStatus} onChange={handleChange} required><option>Active</option><option>Expired</option></select></div>
              </div>
            </section>

            <section className="submit-section issue-section">
              <div className="issue-top-grid">
                <div className="form-group"><label>Issue Title</label><input type="text" name="issueTitle" value={form.issueTitle} placeholder="Short issue title" onChange={handleChange} required /></div>
                <div className="form-group"><label>Location</label><input type="text" name="location" value={form.location} placeholder="City, Region or Branch" onChange={handleChange} required /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea name="description" rows="5" value={form.description} placeholder="Describe your issue..." onChange={handleChange} required /></div>
            </section>
          </div>
        </div>

        <section className="submit-section summary-section">
          <h3 className="section-title">Ticket Summary</h3>
          <div className="summary-grid">
            <div><span>Category:</span> {selectedCategories.length ? selectedCategories.join(", ") : "Not selected"}</div>
            <div><span>Brand:</span> {form.product || "Not selected"}</div>
            <div><span>Product Name:</span> {form.productName || "Not provided"}</div>
            <div><span>Model Number:</span> {form.modelNumber || "Not provided"}</div>
            <div><span>Purchase Date:</span> {form.purchaseDate || "Not provided"}</div>
            <div><span>Warranty Status:</span> {form.warrantyStatus || "Not selected"}</div>
            <div><span>Product Image:</span> {form.productImage || "Not provided"}</div>
            <div><span>Issue Title:</span> {selectedIssues.length ? selectedIssues.join(", ") : form.issueTitle || "Not provided"}</div>
            <div><span>Raised By:</span> {currentUser?.email || "guest@supportdesk.local"}</div>
            <div><span>Location:</span> {form.location || "Not provided"}</div>
          </div>
          <div className="summary-confirm">
            <label className={`summary-confirm-check${!hasRequiredDetails ? " disabled" : ""}`}>
              <input type="checkbox" checked={summaryConfirmed} onChange={(e) => setSummaryConfirmed(e.target.checked)} disabled={!hasRequiredDetails || submitState.loading} />
              <span>I confirm these ticket details are correct.</span>
            </label>
            <p className="summary-confirm-note">
              {hasRequiredDetails ? "Review the summary and confirm to enable ticket submission." : "Complete the required ticket details first, then confirm the summary."}
            </p>
          </div>
        </section>

        <div className="submit-actions"><button className="submit-btn" disabled={submitState.loading || !summaryConfirmed}>{submitState.loading ? "Submitting..." : "Submit Ticket"}</button></div>
        {submitState.message ? <p className={`sd-inline-message ${submitState.type}`}>{submitState.message}</p> : null}
      </form>
    </div>
  );
}

function Dashboard({ tickets, feedback, serviceCenters, health, onNavigate }) {
  const counts = useMemo(() => {
    const open = tickets.filter((ticket) => getTicketStatus(ticket) === "Open").length;
    const inProgress = tickets.filter((ticket) => getTicketStatus(ticket) === "In Progress").length;
    const resolved = tickets.filter((ticket) => getTicketStatus(ticket) === "Resolved").length;
    const avgRating = feedback.length ? (feedback.reduce((sum, item) => sum + Number(item.rating || 0), 0) / feedback.length).toFixed(1) : "0.0";
    return [
      { label: "Open Tickets", value: open, tone: "blue" },
      { label: "In Progress", value: inProgress, tone: "orange" },
      { label: "Resolved", value: resolved, tone: "green" },
      { label: "Avg Rating", value: avgRating, tone: "gold" },
    ];
  }, [tickets, feedback]);

  return (
    <div className="sd-section-stack">
      <section className="sd-hero">
        <div>
          <p className="sd-hero-eyebrow">Customer Support Command Center</p>
          <h1>Track tickets, product issues, support chat, and field service from one workspace.</h1>
          <p>The dashboard is now connected to Express and MongoDB, so every section reflects live backend data.</p>
          <div className="sd-hero-actions">
            <button className="sd-cta-btn" onClick={() => onNavigate("Submit Ticket")}>Create Ticket</button>
            <button className="sd-secondary-btn" onClick={() => onNavigate("Chat Support")}>Open Chat Support</button>
          </div>
        </div>
        <div className="sd-hero-status">
          <div className="sd-status-chip">API {health?.status === "ok" ? "Connected" : "Offline"}</div>
          <div className="sd-status-chip">Mongo State {health?.mongoState ?? "-"}</div>
          <div className="sd-status-chip">Service Hubs {serviceCenters.length}</div>
        </div>
      </section>

      <section className="sd-cards">
        {counts.map((card) => <article key={card.label} className={`sd-card tone-${card.tone}`}><div className="sd-card-label">{card.label}</div><div className="sd-card-value">{card.value}</div></article>)}
      </section>
      <section className="sd-grid-two">
        <div className="sd-panel">
          <div className="sd-panel-head"><h3>Latest Tickets</h3><button className="sd-text-btn" onClick={() => onNavigate("My Tickets")}>View all</button></div>
          {tickets.length ? (
            <div className="sd-mini-list">
              {tickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="sd-mini-item">
                  <div><strong>{ticket.issueTitle}</strong><p>{ticket.productName} · {ticket.location}</p></div>
                  <span className={`sd-pill status-${getTicketStatus(ticket).toLowerCase().replace(/\s+/g, "-")}`}>{getTicketStatus(ticket)}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No tickets yet" text="Create the first support ticket to start the workflow." />}
        </div>

        <div className="sd-panel">
          <div className="sd-panel-head"><h3>Service Centers</h3><span>{serviceCenters.length} hubs</span></div>
          {serviceCenters.length ? (
            <div className="sd-mini-list">
              {serviceCenters.slice(0, 4).map((center) => <div key={center.name} className="sd-mini-item stacked"><div><strong>{center.name}</strong><p>{center.address}</p></div><small>{center.slo}</small></div>)}
            </div>
          ) : <EmptyState title="No service centers" text="The backend will return service center data here." />}
        </div>
      </section>
    </div>
  );
}

function TicketTable({ tickets }) {
  return (
    <div className="sd-table-section">
      <div className="sd-table-header"><h3 className="sd-section-title">Submitted Tickets</h3><span>{tickets.length} total</span></div>
      <div className="sd-table-wrap">
        <table className="sd-table">
          <thead><tr><th>Issue</th><th>Product</th><th>Location</th><th>Priority</th><th>Created</th></tr></thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr className="sd-table-row" key={ticket.id}>
                <td><div className="sd-ticket-subject">{ticket.issueTitle}</div><div className="sd-ticket-id">{ticket.modelNumber}</div></td>
                <td>{ticket.productName}</td>
                <td>{ticket.location}</td>
                <td><span className={`sd-pill priority-${getTicketPriority(ticket).toLowerCase()}`}>{getTicketPriority(ticket)}</span></td>
                <td>{formatDate(ticket.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChatSupport({ history, onSend, chatState }) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    await onSend(message.trim());
    setMessage("");
  };

  return (
    <div className="sd-section-stack">
      <SectionHeader title="Chat Support" subtitle="Ask support questions, use quick prompts, and keep a cleaner conversation history." />
      <section className="sd-chat-shell">
        <div className="sd-chat-toolbar">
          <div>
            <h3>Support Assistant</h3>
            <p>Use the suggestions below for faster help.</p>
          </div>
          <div className="sd-chat-suggestions">
            {CHAT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="sd-chat-suggestion"
                onClick={() => setMessage(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        <div className="sd-chat-history">
          {history.length ? history.map((entry) => (
            <div key={entry.id} className="sd-chat-pair">
              <div className="sd-chat-meta">You · {formatDate(entry.createdAt)}</div>
              <div className="sd-chat-bubble user">{entry.userMessage}</div>
              <div className="sd-chat-meta">Support Assistant</div>
              <div className="sd-chat-bubble bot">{entry.botReply}</div>
            </div>
          )) : <EmptyState title="No chat history" text="Start a conversation to populate support chat history." />}
        </div>
        <form className="sd-chat-form" onSubmit={handleSubmit}>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask about a product, warranty, ticket, or service center" />
          <button className="submit-btn" disabled={chatState.loading}>{chatState.loading ? "Sending..." : "Send"}</button>
        </form>
        {chatState.message ? <p className={`sd-inline-message ${chatState.type}`}>{chatState.message}</p> : null}
      </section>
    </div>
  );
}

function FAQView({ faqs, onCreateFaq, faqState }) {
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "General" });
  const [historyOpen, setHistoryOpen] = useState(true);
  const submitFaq = async (e) => {
    e.preventDefault();
    await onCreateFaq(faqForm);
    setFaqForm({ question: "", answer: "", category: "General" });
  };

  return (
    <div className="sd-section-stack">
      <SectionHeader title="FAQ" subtitle="Common answers from MongoDB, with a quick admin add form." />
      <section className="sd-grid-two faq-layout">
        <div className="sd-panel">
          {faqs.length ? (
            <article className={`sd-faq-item accordion${historyOpen ? " open" : ""}`}>
              <button className="sd-accordion-toggle" type="button" onClick={() => setHistoryOpen((open) => !open)} aria-expanded={historyOpen}>
                <div className="sd-accordion-copy">
                  <div className="sd-faq-top"><span className="sd-chip">FAQ History</span><span className="sd-chip accent">{faqs.length} Items</span></div>
                  <h3>Current and Previous FAQs</h3>
                </div>
                <span className={`sd-accordion-arrow${historyOpen ? " open" : ""}`}>›</span>
              </button>
              {historyOpen ? (
                <div className="sd-accordion-body sd-faq-history">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="sd-faq-history-item">
                      <div className="sd-faq-top"><span className="sd-chip">{faq.category}</span>{faq.featured ? <span className="sd-chip accent">Featured</span> : null}</div>
                      <h3>{faq.question}</h3>
                      <p>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ) : <EmptyState title="No FAQs yet" text="Add the first FAQ to start the history." />}
        </div>

        <form className="sd-panel sd-form-panel" onSubmit={submitFaq}>
          <h3>Add FAQ</h3>
          <div className="form-group"><label>Question</label><input value={faqForm.question} onChange={(e) => setFaqForm((prev) => ({ ...prev, question: e.target.value }))} required /></div>
          <div className="form-group"><label>Answer</label><textarea rows="5" value={faqForm.answer} onChange={(e) => setFaqForm((prev) => ({ ...prev, answer: e.target.value }))} required /></div>
          <div className="form-group"><label>Category</label><input value={faqForm.category} onChange={(e) => setFaqForm((prev) => ({ ...prev, category: e.target.value }))} required /></div>
          <button className="submit-btn" disabled={faqState.loading}>{faqState.loading ? "Saving..." : "Save FAQ"}</button>
          {faqState.message ? <p className={`sd-inline-message ${faqState.type}`}>{faqState.message}</p> : null}
        </form>
      </section>
    </div>
  );
}
function UpdatesView({ feedback, onSubmitFeedback, feedbackState, tickets }) {
  const [form, setForm] = useState(INITIAL_FEEDBACK_FORM);
  const [historyOpen, setHistoryOpen] = useState(true);
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmitFeedback(form);
    setForm(INITIAL_FEEDBACK_FORM);
  };

  return (
    <div className="sd-section-stack">
      <SectionHeader title="What's New" subtitle="Collect customer feedback and review recent improvements in one place." />
      <section className="sd-grid-two">
        <div className="sd-panel">
          {feedback.length ? (
            <article className={`sd-mini-item accordion${historyOpen ? " open" : ""}`}>
              <button className="sd-accordion-toggle" type="button" onClick={() => setHistoryOpen((open) => !open)} aria-expanded={historyOpen}>
                <div className="sd-accordion-copy">
                  <div className="sd-faq-top"><span className="sd-chip">Feedback History</span><span className="sd-chip accent">{feedback.length} Items</span></div>
                  <h3>Current and Previous Feedback</h3>
                </div>
                <span className={`sd-accordion-arrow${historyOpen ? " open" : ""}`}>›</span>
              </button>
              {historyOpen ? (
                <div className="sd-accordion-body sd-faq-history">
                  {feedback.map((item) => (
                    <div key={item.id} className="sd-faq-history-item">
                      <strong>{item.name}</strong>
                      <p>{item.email} · {item.rating}/5</p>
                      <p>{item.message}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ) : <EmptyState title="No feedback yet" text="Submit feedback to see MongoDB-backed responses here." />}
        </div>

        <form className="sd-panel sd-form-panel" onSubmit={handleSubmit}>
          <h3>Share Feedback</h3>
          <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required /></div>
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Rating</label><select value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}</select></div>
            <div className="form-group"><label>Related Ticket</label><select value={form.ticketId} onChange={(e) => setForm((prev) => ({ ...prev, ticketId: e.target.value }))}><option value="">Optional</option>{tickets.map((ticket) => <option key={ticket.id} value={ticket.id}>{ticket.issueTitle}</option>)}</select></div>
          </div>
          <div className="form-group"><label>Message</label><textarea rows="5" value={form.message} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} required /></div>
          <button className="submit-btn" disabled={feedbackState.loading}>{feedbackState.loading ? "Saving..." : "Submit Feedback"}</button>
          {feedbackState.message ? <p className={`sd-inline-message ${feedbackState.type}`}>{feedbackState.message}</p> : null}
        </form>
      </section>
    </div>
  );
}

function AuthPanel({ authMode, setAuthMode, authForm, setAuthForm, onAuthSubmit, authState, currentUser, onClose }) {
  return (
    <section className="sd-auth-card">
      <div className="sd-auth-top">
        <div className="sd-auth-heading"><h3>{currentUser ? "Signed In" : authMode === "login" ? "Login" : "Create Account"}</h3>{currentUser ? <p>{`Connected as ${currentUser.email}`}</p> : null}</div>
        <div className="sd-auth-controls">
          {!currentUser ? <div className="sd-auth-switch"><button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")} type="button">Login</button><button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")} type="button">Register</button></div> : null}
          <button className="sd-auth-close" onClick={onClose} type="button" aria-label="Close login panel">×</button>
        </div>
      </div>

      {currentUser ? (
        <div className="sd-user-summary"><div className="sd-avatar large">{getInitials(currentUser.name || currentUser.email)}</div><div><strong>{currentUser.name || "Support User"}</strong><p>{currentUser.email}</p></div></div>
      ) : (
        <form className="sd-auth-form" onSubmit={onAuthSubmit}>
          {authMode === "register" ? <div className="form-group"><label>Name</label><input value={authForm.name} onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))} required /></div> : null}
          <div className="form-group"><label>Email</label><input type="email" value={authForm.email} onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))} required /></div>
          <div className="form-group"><label>Password</label><input type="password" value={authForm.password} onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))} required /></div>
          <button className="submit-btn" disabled={authState.loading}>{authState.loading ? "Please wait..." : authMode === "login" ? "Login" : "Register"}</button>
          {authState.message ? <p className={`sd-inline-message ${authState.type}`}>{authState.message}</p> : null}
        </form>
      )}
    </section>
  );
}

export default function SupportDesk() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState(INITIAL_TICKET_FORM);
  const [authForm, setAuthForm] = useState(INITIAL_AUTH_FORM);
  const [authMode, setAuthMode] = useState("register");
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState("");
  const [tickets, setTickets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitState, setSubmitState] = useState({ loading: false, type: "", message: "" });
  const [chatState, setChatState] = useState({ loading: false, type: "", message: "" });
  const [faqState, setFaqState] = useState({ loading: false, type: "", message: "" });
  const [feedbackState, setFeedbackState] = useState({ loading: false, type: "", message: "" });
  const [authState, setAuthState] = useState({ loading: false, type: "", message: "" });

  const filteredTickets = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tickets;
    return tickets.filter((ticket) => [ticket.issueTitle, ticket.productName, ticket.location, getTicketStatus(ticket), getTicketPriority(ticket)].filter(Boolean).some((value) => String(value).toLowerCase().includes(term)));
  }, [tickets, search]);

  const loadData = async () => {
    setLoading(true);
    setLoadError("");
    const results = await Promise.allSettled([
      api.getHealth(),
      api.getTickets(),
      api.getFaqs(),
      api.getFeedback(),
      api.getChatHistory(),
      api.getServiceCenters(),
    ]);

    const [
      healthResult,
      ticketsResult,
      faqsResult,
      feedbackResult,
      historyResult,
      centerResult,
    ] = results;

    setHealth(healthResult.status === "fulfilled" ? healthResult.value : { status: "offline", mongoState: "-" });
    setTickets(ticketsResult.status === "fulfilled" ? ticketsResult.value : []);
    setFaqs(faqsResult.status === "fulfilled" ? faqsResult.value : []);
    setFeedback(feedbackResult.status === "fulfilled" ? feedbackResult.value : []);
    setChatHistory(historyResult.status === "fulfilled" ? historyResult.value : []);
    setServiceCenters(centerResult.status === "fulfilled" ? centerResult.value : []);

    const failedMessages = results
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason?.message)
      .filter((message) => message && message !== "Not Found");

    if (failedMessages.length) {
      setLoadError(failedMessages.join(" | "));
    }

    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    try {
      if (token) localStorage.setItem("supportdesk-token", token);
      else localStorage.removeItem("supportdesk-token");
    } catch (_error) {
      // Ignore storage errors so the app still renders.
    }
  }, [token]);
  useEffect(() => {
    if (currentUser) {
      setAuthOpen(false);
    } else {
      setProfileOpen(false);
    }
  }, [currentUser]);
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setSubmitState({ loading: true, type: "", message: "" });
    try {
      const payload = {
        ...ticketForm,
        category: resolveCategory(ticketForm.issueTitle, ticketForm.category),
        customerEmail: currentUser?.email || "guest@supportdesk.local"
      };
      const created = await api.createTicket(payload);
      try {
        const refreshedTickets = await api.getTickets();
        setTickets(refreshedTickets);
      } catch (_refreshError) {
        setTickets((prev) => [created, ...prev]);
      }
      setTicketForm(INITIAL_TICKET_FORM);
      setSearch("");
      setSubmitState({ loading: false, type: "success", message: "Ticket submitted successfully." });
      setActiveNav("My Tickets");
    } catch (error) {
      setSubmitState({ loading: false, type: "error", message: error.message });
    }
  };

  const handleChatSend = async (message) => {
    setChatState({ loading: true, type: "", message: "" });
    try {
      const created = await api.sendChatMessage(message);
      setChatHistory((prev) => [
        ...prev,
        {
          id: `chat-${Date.now()}`,
          userMessage: message,
          botReply: created.reply,
          createdAt: new Date().toISOString(),
        },
      ]);
      setChatState({ loading: false, type: "success", message: "Reply received." });
    } catch (error) {
      setChatState({ loading: false, type: "error", message: error.message });
    }
  };

  const handleCreateFaq = async (payload) => {
    setFaqState({ loading: true, type: "", message: "" });
    try {
      const created = await api.createFaq(payload);
      setFaqs((prev) => [created, ...prev]);
      setFaqState({ loading: false, type: "success", message: "FAQ saved." });
    } catch (error) {
      setFaqState({ loading: false, type: "error", message: error.message });
    }
  };

  const handleSubmitFeedback = async (payload) => {
    setFeedbackState({ loading: true, type: "", message: "" });
    try {
      const created = await api.createFeedback(payload);
      setFeedback((prev) => [created, ...prev]);
      setFeedbackState({ loading: false, type: "success", message: "Feedback submitted." });
    } catch (error) {
      setFeedbackState({ loading: false, type: "error", message: error.message });
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    setCurrentUser(null);
    setToken("");
    setAuthForm(INITIAL_AUTH_FORM);
    setAuthState({ loading: false, type: "", message: "" });
    setAuthMode("login");
    setAuthOpen(true);
    try {
      localStorage.removeItem("supportdesk-user");
      localStorage.removeItem("supportdesk-token");
    } catch (_error) {
      // Ignore storage errors so logout still works.
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthState({ loading: true, type: "", message: "" });
    try {
      if (authMode === "login") {
        const response = await api.login({ email: authForm.email, password: authForm.password });
        if (response.token) setToken(response.token);
        if (response.user) {
          setCurrentUser(response.user);
          try {
            localStorage.setItem("supportdesk-user", JSON.stringify(response.user));
          } catch (_error) {
            // Ignore storage errors so the app still renders.
          }
        }
        setAuthForm(INITIAL_AUTH_FORM);
        setAuthState({ loading: false, type: "success", message: "Logged in successfully." });
      } else {
        await api.register(authForm);
        setAuthForm({ ...INITIAL_AUTH_FORM, email: authForm.email });
        setAuthMode("login");
        setAuthState({ loading: false, type: "success", message: "Account registered successfully. Please login to continue." });
      }
    } catch (error) {
      setAuthState({ loading: false, type: "error", message: error.message });
    }
  };

  const renderContent = () => {
    if (loading) return <EmptyState title="Loading workspace" text="Pulling tickets, products, chat history, FAQs, and service centers from the backend." />;

    switch (activeNav) {
      case "Dashboard":
        return <Dashboard tickets={tickets} feedback={feedback} serviceCenters={serviceCenters} health={health} onNavigate={setActiveNav} />;
      case "Submit Ticket":
        return <SubmitTicket form={ticketForm} setForm={setTicketForm} onSubmit={handleTicketSubmit} submitState={submitState} currentUser={currentUser} />;
      case "My Tickets":
        return <TicketTable tickets={filteredTickets} />;
      case "Chat Support":
        return <ChatSupport history={chatHistory} onSend={handleChatSend} chatState={chatState} />;
      case "FAQ":
        return <FAQView faqs={faqs} onCreateFaq={handleCreateFaq} faqState={faqState} />;
      case "What's New":
        return <UpdatesView feedback={feedback} onSubmitFeedback={handleSubmitFeedback} feedbackState={feedbackState} tickets={tickets} />;
      default:
        return null;
    }
  };

  return (
    <div className={`sd-root${darkMode ? " dark" : ""}${sidebarOpen ? " sidebar-open" : ""}`}>
      <header className="sd-navbar">
        <button className="sd-logo" onClick={() => { setActiveNav("Dashboard"); setSidebarOpen(true); }} title="Open Dashboard"><span className="sd-logo-text">SupportDesk</span></button>
        <div className="sd-nav-center"><div className="sd-search-wrap"><span className="sd-search-icon">Search</span><input className="sd-search" placeholder="Search tickets, users, reports..." value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>
        <div className="sd-nav-actions">
          {!currentUser ? (
            <div className="sd-nav-auth-slot">
              <button className="sd-login-btn" onClick={() => { setAuthMode("login"); setAuthOpen(true); }} type="button">Login</button>
            </div>
          ) : (
            <div className="sd-nav-auth-slot">
              <button className="sd-login-btn sd-logout-btn" onClick={handleLogout} type="button">Logout</button>
            </div>
          )}
          <div className="sd-nav-theme-slot">
            <button className="sd-icon-btn" onClick={() => setDarkMode((value) => !value)} title="Toggle dark mode">{darkMode ? "Light" : "Dark"}</button>
          </div>
          <div className="sd-nav-profile-slot">
            {currentUser ? <button className="sd-profile-trigger" onClick={() => setProfileOpen(true)} type="button" aria-label="Open profile"><UserAvatar className="sd-avatar" /></button> : null}
          </div>
        </div>
      </header>

      {!authOpen ? (
        <div className="sd-top-nav-wrap">
          <nav className="sd-top-nav">
            {NAV_ITEMS.filter((item) => item.label !== "Dashboard").map((item) => <button key={`top-${item.label}`} className={`sd-top-nav-item${activeNav === item.label ? " active" : ""}`} onClick={() => { setActiveNav(item.label); setSidebarOpen(true); }}><span className="sd-top-nav-label">{item.label}</span></button>)}
          </nav>
        </div>
      ) : null}

      <div className={`sd-body${authOpen ? " auth-open" : ""}`}>
        {!authOpen ? (
          <>
            <button className={`sd-sidebar-toggle${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen((open) => !open)} title={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}>{sidebarOpen ? "<" : ">"}</button>
            <aside className={`sd-sidebar${sidebarOpen ? " open" : ""}`}>
              <nav className="sd-nav">{NAV_ITEMS.map((item) => <button key={item.label} className={`sd-nav-item${activeNav === item.label ? " active" : ""}`} onClick={() => setActiveNav(item.label)}><span className="sd-nav-label">{item.label}</span></button>)}</nav>
              {currentUser ? <div className="sd-sidebar-footer"><div className="sd-sidebar-user"><UserAvatar className="sd-sidebar-avatar" title="Profile" /><div><div className="sd-sidebar-name">{currentUser.name || "Support User"}</div><div className="sd-sidebar-role">{currentUser.role || "Support Workspace"}</div></div></div></div> : null}
            </aside>
          </>
        ) : null}

        <main className={`sd-main${authOpen ? " auth-open" : ""}`}>
          {authOpen ? (
            <div className="sd-auth-overlay" onClick={() => setAuthOpen(false)} role="presentation">
              <div className="sd-auth-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Authentication panel">
                <AuthPanel authMode={authMode} setAuthMode={setAuthMode} authForm={authForm} setAuthForm={setAuthForm} onAuthSubmit={handleAuthSubmit} authState={authState} currentUser={currentUser} onClose={() => setAuthOpen(false)} />
              </div>
            </div>
          ) : null}
          {profileOpen ? <ProfilePanel currentUser={currentUser} onClose={() => setProfileOpen(false)} onLogout={handleLogout} /> : null}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}


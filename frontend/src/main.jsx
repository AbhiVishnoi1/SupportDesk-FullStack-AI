import { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Unexpected render error",
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "32px", fontFamily: "Segoe UI, sans-serif" }}>
          <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>App failed to render</h1>
          <p style={{ marginBottom: "16px" }}>{this.state.message}</p>
          <p>Try refreshing the page. If it keeps happening, clear local storage for this site.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)

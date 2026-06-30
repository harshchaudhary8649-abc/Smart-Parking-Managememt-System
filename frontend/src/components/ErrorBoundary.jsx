import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("SmartPark render error", error, info);
  }

  resetApp = () => {
    localStorage.removeItem("smartpark_user");
    localStorage.removeItem("smartpark_token");
    window.location.href = "/";
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <section className="crash-page">
        <div className="form-card">
          <p className="eyebrow">App recovery</p>
          <h2>SmartPark could not load</h2>
          <p className="muted">
            Browser mein purana saved login data corrupt ho sakta hai. Reset karke app fresh start ho jayega.
          </p>
          <pre>{this.state.error.message}</pre>
          <button className="primary-button wide" onClick={this.resetApp}>
            Reset and Open App
          </button>
        </div>
      </section>
    );
  }
}

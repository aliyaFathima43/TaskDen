import { Link } from "react-router-dom";

function SplashPage() {
  const token = localStorage.getItem("todo_token");

  return (
    <div className="splash-screen text-center">
      <div className="splash-glow splash-glow-one" />
      <div className="splash-glow splash-glow-two" />
      <div className="splash-stars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="splash-card">
        <p className="splash-kicker">Welcome to</p>
        <h1 className="splash-title mb-3">TaskDen</h1>

        <p className="splash-subtitle lead mb-4">
          A pretty, peaceful space for planning your day.
        </p>

        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link to={token ? "/dashboard" : "/register"} className="btn btn-primary px-4 py-2">
            {token ? "Open Dashboard" : "Get Started"}
          </Link>

          <Link to="/login" className="btn btn-outline-primary px-4 py-2">
            Login
          </Link>
        </div>
        <div className="splash-preview mt-4" aria-hidden="true">
          <span className="preview-line preview-line-wide" />
          <span className="preview-line" />
          <span className="preview-pill" />
        </div>
      </div>
    </div>
  );
}

export default SplashPage;

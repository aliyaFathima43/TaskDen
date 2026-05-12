import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { applyTheme, getInitialTheme, toggleTheme } from "../theme";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme());
  const navigate = useNavigate();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await loginUser({ username, password });
      localStorage.setItem("todo_token", response.data.token);
      localStorage.setItem("todo_user", JSON.stringify(response.data.user));
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <button className="btn btn-outline-secondary btn-sm theme-btn" onClick={() => setTheme(toggleTheme(theme))}>
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>
      <div className="auth-card card border-0 shadow-lg">
        <div className="card-body p-4">
          <h2 className="fw-bold mb-1">Welcome back</h2>
          <p className="text-secondary mb-4">Sign in to continue managing your goals.</p>

          <form onSubmit={handleSubmit}>
            <label className="form-label">Username</label>
            <input
              className="form-control mb-3"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control mb-3"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {errorMessage && <div className="alert alert-danger py-2">{errorMessage}</div>}
            <button className="btn btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="small text-secondary mt-3 mb-0">
            New here? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

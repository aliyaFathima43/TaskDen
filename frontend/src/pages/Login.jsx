import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { applyTheme, getInitialTheme, toggleTheme } from "../theme";

function Login() {
  const [email, setEmail] = useState("");
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

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    setIsSubmitting(false);

    if (error) {
      const message = error.message.toLowerCase().includes("email not confirmed")
        ? "Email confirmation is still enabled in Supabase. Disable Confirm email in your Supabase Auth settings, then create/login normally."
        : error.message;
      setErrorMessage(message);
      return;
    }

    navigate("/dashboard", { replace: true });
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
            <label className="form-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className="form-control mb-3"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="form-control mb-3"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
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

export default Login;

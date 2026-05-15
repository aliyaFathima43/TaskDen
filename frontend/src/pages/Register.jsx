import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { applyTheme, getInitialTheme, toggleTheme } from "../theme";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
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
    setInfoMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`
      }
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data.session) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (!signInError) {
      navigate("/dashboard", { replace: true });
      return;
    }

    setInfoMessage("Account created. Supabase is still asking for email confirmation, so turn off Confirm email once in Authentication > Providers > Email.");
  };

  return (
    <div className="auth-shell">
      <button className="btn btn-outline-secondary btn-sm theme-btn" onClick={() => setTheme(toggleTheme(theme))}>
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="auth-card card border-0 shadow-lg">
        <div className="card-body p-4">
          <h2 className="fw-bold mb-1">Create account</h2>
          <p className="text-secondary mb-4">Start tracking tasks with your secure workspace.</p>

          <form onSubmit={handleSubmit}>
            <label className="form-label" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              className="form-control mb-3"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <label className="form-label" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              className="form-control mb-3"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />

            {errorMessage && <div className="alert alert-danger py-2">{errorMessage}</div>}
            {infoMessage && <div className="alert alert-info py-2">{infoMessage}</div>}

            <button className="btn btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Register"}
            </button>
          </form>

          <p className="small text-secondary mt-3 mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

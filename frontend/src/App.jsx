import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SplashPage from "./pages/SplashPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { supabase } from "./supabaseClient";

function PublicRoute({ children, isAuthLoading, user }) {
  if (isAuthLoading) {
    return (
      <div className="auth-shell">
        <div className="auth-card card border-0 shadow-lg">
          <div className="card-body p-4 text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const user = session?.user ?? null;

  useEffect(() => {
    const timerId = window.setTimeout(() => setShowIntro(false), 1800);
    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("Supabase session error:", error.message);
      }

      setSession(data.session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {showIntro && (
        <div className="startup-splash" aria-label="TaskDen loading">
          <div className="startup-orbits" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="startup-mark">
            <span>TaskDen</span>
            <small>plan softly, finish strong</small>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/splash"} replace />} />
        <Route path="/splash" element={<SplashPage isAuthLoading={isAuthLoading} user={user} />} />
        <Route
          path="/login"
          element={
            <PublicRoute isAuthLoading={isAuthLoading} user={user}>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute isAuthLoading={isAuthLoading} user={user}>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthLoading={isAuthLoading} user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </>
  );
}

export default App;

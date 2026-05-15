import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, isAuthLoading, user }) {
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="auth-shell">
        <div className="auth-card card border-0 shadow-lg">
          <div className="card-body p-4 text-center">
            <h2 className="fw-bold mb-2">Checking your session</h2>
            <p className="text-secondary mb-0">Loading your secure workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;

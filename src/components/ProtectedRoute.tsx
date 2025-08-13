import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface JWTPayload {
  exp?: number;
  [key: string]: unknown;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  // read token synchronously (safe in render)
  const token = localStorage.getItem("token");

  let decoded: JWTPayload | null = null;
  if (token) {
    try {
      decoded = jwtDecode<JWTPayload>(token);
    } catch (e) {
      console.warn("Invalid token while decoding:", e);
      decoded = null;
    }
  }

  // effect always registered (hooks must run unconditionally)
  useEffect(() => {
    if (!token) return;

    if (!decoded) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    const nowSec = Date.now() / 1000;

    if (decoded.exp && decoded.exp < nowSec) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    if (decoded.exp) {
      const msUntilExpiry = Math.max(0, decoded.exp * 1000 - Date.now());
      const t = window.setTimeout(() => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }, msUntilExpiry);

      return () => clearTimeout(t);
    }

    return;
  }, [token, decoded?.exp, navigate]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (!decoded) {
    return <Navigate to="/login" replace />;
  }
  if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // token valid -> render protected children
  return <>{children}</>;
}

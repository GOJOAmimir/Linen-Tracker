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

  const decodedExp = decoded?.exp ?? null;

  // effect always registered (hooks must run unconditionally)
  useEffect(() => {
    if (!token) return;

    if (decodedExp === null && !decoded) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    const nowSec = Date.now() / 1000;

    if (decodedExp && decodedExp < nowSec) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    if (decodedExp) {
      const msUntilExpiry = Math.max(0, decodedExp * 1000 - Date.now());
      const t = window.setTimeout(() => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }, msUntilExpiry);

      return () => clearTimeout(t);
    }

    return;
  }, [token, decodedExp, decoded, navigate]);

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

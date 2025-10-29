import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  username: string;
  role: string;
  exp: number;
}

export function getUserFromToken(): JWTPayload | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded;
  } catch {
    return null;
  }
}

export function getUserRole(): string | null {
  const user = getUserFromToken();
  return user?.role || null;
}

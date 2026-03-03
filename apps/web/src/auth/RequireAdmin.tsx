import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

export function RequireAdmin() {
  const { token, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="p-6 text-zinc-600">Checking session…</p>;
  if (!token || !user)
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (user.role !== "ADMIN") return <p className="p-6 text-red-600">Forbidden (admin only)</p>;

  return <Outlet />;
}

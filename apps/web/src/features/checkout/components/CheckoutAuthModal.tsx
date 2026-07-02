import { useState } from "react";
import { login as apiLogin, register as apiRegister } from "../../../api/auth";
import { useAuth } from "../../../auth/useAuth";

type CheckoutAuthModalProps = {
  onClose: () => void;
  onGuestCheckout: () => void;
};

export function CheckoutAuthModal({ onClose, onGuestCheckout }: CheckoutAuthModalProps) {
  const [view, setView] = useState<"choose" | "login" | "register">("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const { setToken } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await apiLogin({ email, password });
      setToken(result.token);
      onClose();
      // User will see checkout page with their info
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiRegister({ email, password, redirect: "checkout" });
      setRegisterSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (view === "choose") {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-6">Checkout</h2>
          <div className="space-y-3">
            <button
              onClick={onGuestCheckout}
              className="w-full px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Continue as Guest
            </button>
            <button
              onClick={() => setView("login")}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Log In
            </button>
            <button
              onClick={() => setView("register")}
              className="w-full px-6 py-3 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
            >
              Register
            </button>
          </div>
          <button onClick={onClose} className="mt-4 text-gray-600 hover:underline w-full">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (view === "login") {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-6">Log In</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => setView("register")} className="text-blue-600 hover:underline">
              Don't have an account? Register
            </button>
          </div>
          <button
            onClick={() => setView("choose")}
            className="mt-2 text-gray-600 hover:underline w-full"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (view === "register") {
    if (registerSuccess) {
      return (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong>{email}</strong>. Click the link to verify
              your account, then you'll be redirected to checkout.
            </p>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-6">Register</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
                minLength={8}
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => setView("login")} className="text-blue-600 hover:underline">
              Already have an account? Log In
            </button>
          </div>
          <button
            onClick={() => setView("choose")}
            className="mt-2 text-gray-600 hover:underline w-full"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return null;
}

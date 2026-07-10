import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getApiBaseUrl } from "../../../api/http.js";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid verification link");
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    const verify = async () => {
      try {
        const base = getApiBaseUrl();
        console.log(`Token from URL: ${token}`);
        console.log(`Calling API: ${base}/api/auth/verify-email?token=${token}`);

        const res = await fetch(`${base}/api/auth/verify-email?token=${token}`, {
          signal: abortController.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error("Verification failed:", data);
          throw new Error(data.error || "Verification failed");
        }

        console.log("Verification successful");
        setSuccess(true);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          console.log("Request aborted");
          return;
        }
        console.error("Error during verification:", err);
        setError(err instanceof Error ? err.message : "Verification failed");
      } finally {
        setLoading(false);
      }
    };

    verify();

    return () => {
      abortController.abort();
    };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">✗</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Failed</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    // Check if there's a redirect parameter (from email link)
    const redirect = searchParams.get("redirect");
    const destination = redirect === "checkout" ? "/checkout" : "/login";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h2>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified.{" "}
            {redirect === "checkout"
              ? "You can now complete your checkout."
              : "You can now log in."}
          </p>
          <Link
            to={destination}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {redirect === "checkout" ? "Go to Checkout" : "Go to Login"}
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

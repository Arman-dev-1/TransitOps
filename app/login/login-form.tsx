"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const roleRedirects: Record<string, string> = {
  FLEET_MANAGER: "/admin/dashboard",
  DRIVER: "/driver/dashboard",
  SAFETY_OFFICER: "/safety/dashboard",
  FINANCIAL_ANALYST: "/finance/dashboard",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setError("");
    setLoading(true);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role ?? "FLEET_MANAGER";
    window.location.href = roleRedirects[role] ?? "/admin/dashboard";
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/" className="landing-brand">
          <span>◈</span> Transit Ops
        </Link>
        <p className="auth-kicker">SIGN IN</p>
        <h1>Welcome back</h1>
        {registered && <p className="auth-success">Admin account created. Sign in to open your command center.</p>}
        <form action={submit}>
          <label>
            Email
            <input name="email" type="email" placeholder="Enter email" required autoComplete="email" />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"} <span>→</span>
          </button>
        </form>
        <p className="auth-switch">
          Need an admin workspace? <Link href="/signup">Create account</Link>
        </p>
        <Link href="/" className="auth-back">
          Back to home
        </Link>
      </div>
    </main>
  );
}

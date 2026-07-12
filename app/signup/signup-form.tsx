"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Unable to create account.");
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/" className="landing-brand">
          <span>◈</span> Transit Ops
        </Link>
        <p className="auth-kicker">ADMIN WORKSPACE</p>
        <h1>Create your command center</h1>
        <form action={submit}>
          <label>
            Full name
            <input name="name" type="text" placeholder="Your name" required autoComplete="name" />
          </label>
          <label>
            Work email
            <input name="email" type="email" placeholder="you@transitops.com" required autoComplete="email" />
          </label>
          <label>
            Password
            <input name="password" type="password" placeholder="At least 8 characters" minLength={8} required autoComplete="new-password" />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create admin account"} <span>→</span>
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
        <p className="auth-note">Fleet managers can sign up directly. Drivers and other roles need an invitation from an administrator.</p>
      </div>
    </main>
  );
}

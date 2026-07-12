"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  async function submit(formData: FormData) {
    setError("");
    await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), callbackUrl: "/admin/dashboard" });
  }
  return <main className="min-h-screen flex items-center justify-center bg-gray-100"><div className="w-full max-w-md rounded-xl bg-white shadow-lg p-8"><h1 className="text-3xl font-bold text-center mb-2">Transit Ops</h1><p className="text-center text-gray-500 mb-8">Sign in to your account</p><form action={submit} className="space-y-5"><div><label className="block mb-2 text-sm font-medium">Email</label><input name="email" type="email" placeholder="Enter email" required autoComplete="email" className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" /></div><div><label className="block mb-2 text-sm font-medium">Password</label><div className="relative"><input name="password" type={showPassword ? "text" : "password"} placeholder="Enter password" required autoComplete="current-password" className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-black" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></div>{error && <p className="text-sm text-red-600">{error}</p>}<button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900">Sign In</button></form><p className="text-center text-sm mt-6">Need an account? <span className="font-semibold">Ask your Transit Ops administrator for an invitation.</span></p><Link href="/" className="block text-center text-sm mt-4 underline">Back to home</Link></div></main>;
}

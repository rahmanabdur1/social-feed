"use client";

import { useState } from "react";
import { login } from "../../src/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      console.log("Login success:", data);

      // Redirect after login
      window.location.href = "/feed";
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid email or password";
      const apiError = err as { response?: { data?: { detail?: string } } };
      setError(apiError?.response?.data?.detail || errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f7] flex flex-col">
      {/* Header */}
      <header className="w-full bg-[#f5f6f7]">
        <div className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Editorial</h1>
          <a
            href="/register"
            className="px-5 py-2 rounded-lg bg-[#4252b4] text-white text-sm font-bold"
          >
            Sign Up
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-10">
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">
              Access your workspace and manage your content.
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <input
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b py-3 outline-none focus:border-[#4252b4]"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between text-sm text-gray-500">
                <label>Password</label>
                <a href="#" className="text-[#4252b4]">
                  Forgot?
                </a>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b py-3 outline-none focus:border-[#4252b4]"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  👁
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4252b4] to-[#3646a8] text-white font-bold uppercase text-sm"
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 text-center text-gray-400 text-sm">
            OR
          </div>

        

          {/* Footer */}
          <p className="text-center text-sm mt-6 text-gray-500">
            Dont have an account?{" "}
            <a href="/register" className="text-[#4252b4] font-semibold">
              Join now
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "../../src/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ first_name: firstName, last_name: lastName, email, password });
      router.push("/login");
    } catch {
      setError("Registration failed. Email may already exist.");
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
            href="/login"
            className="px-5 py-2 rounded-lg bg-[#4252b4] text-white text-sm font-bold"
          >
            Sign In
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-10">
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Create Account</h2>
            <p className="text-gray-500 text-sm">
              Join the workspace and manage your content.
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border-b py-3 outline-none focus:border-[#4252b4]"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border-b py-3 outline-none focus:border-[#4252b4]"
                  required
                />
              </div>
            </div>

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
              <label className="text-sm text-gray-500">Password</label>
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
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 text-center text-gray-400 text-sm">OR</div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-[#4252b4] font-bold">
              Sign In
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
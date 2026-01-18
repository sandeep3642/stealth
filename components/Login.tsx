"use client";

import React, { useState } from "react";
import { AtSign, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/authService";

interface LoginComponentProps {
  onSwitchToRegister: () => void;
}

export const LoginComponent: React.FC<LoginComponentProps> = ({
  onSwitchToRegister,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await loginUser(email, password);

      // Store token
      if (response?.accessToken) {
        localStorage.setItem("authToken", response.accessToken);
        router.push("/dashboard");
      }

      // if (response.user) {
      //   localStorage.setItem("user", JSON.stringify(response.user));
      // }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
          Welcome Back
        </h2>
        <p className="text-zinc-500">
          Enter your credentials to access your account.
        </p>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">
              Email or Mobile
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-11 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="flex h-11 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 pr-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between pt-2">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setRememberMe(!rememberMe)}
            >
              <div
                className={`h-4 w-4 rounded border flex items-center justify-center ${
                  rememberMe
                    ? "bg-purple-600 border-purple-600"
                    : "border-zinc-300 bg-white"
                }`}
              >
                {rememberMe && (
                  <svg
                    className="h-3 w-3 text-white"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <label className="text-sm font-medium text-zinc-600 select-none">
                Remember me
              </label>
            </div>
            <button className="text-sm font-medium text-purple-600 hover:text-purple-700">
              Forgot password?
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-base font-semibold w-full h-11 bg-purple-600 text-white shadow-md hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>

      <div className="text-center text-sm text-zinc-500">
        Don’t have an account?{" "}
        <button
          onClick={onSwitchToRegister}
          className="font-semibold text-purple-600 hover:underline"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

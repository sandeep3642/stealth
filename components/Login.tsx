"use client";

import React, { useState, useEffect } from "react";
import { AtSign, Lock, Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useColor } from "@/context/ColorContext";
import { getUserRoleData } from "@/services/commonServie";
import { applyWhiteLabelColors } from "@/utils/themeUtils";

interface LoginComponentProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

export const LoginComponent: React.FC<LoginComponentProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
}) => {
  const {
    selectedColor,
    handleColorChange,
    colorBlock,
    setColorBlock,
    hexToHsl,
  } = useColor();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      const response = await loginUser(email, password);

      if (response.data.token) {
        // ✅ set user + token
        localStorage.setItem("authToken", response.data.token.accessToken);
        localStorage.setItem("user", JSON.stringify(response.data));
        Cookies.set("authToken", response.data.token.accessToken, {
          path: "/",
        });

        if (response.data.whiteLabel) {
          const whiteLabel = response.data.whiteLabel;
          applyWhiteLabelColors(whiteLabel,handleColorChange);

          // persist in localStorage for reloads
          localStorage.setItem("whiteLabelTheme", JSON.stringify(whiteLabel));
        }

        // ✅ Fetch and store permissions BEFORE redirect
        await getUserRoleData();

        // ✅ Dispatch event to notify layout about new permissions
        window.dispatchEvent(new Event("permissions-updated"));

        // ✅ Now redirect
        router.push("/dashboard");
      }
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
    <div className="w-full max-w-[400px] px-4 sm:px-6 md:px-0 space-y-6 sm:space-y-8">
      <div className="space-y-1 sm:space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          Welcome Back
        </h2>
        <p className="text-sm sm:text-base text-zinc-500">
          Enter your credentials to access your account.
        </p>
      </div>

      <div className="space-y-5 sm:space-y-6">
        {error && (
          <div className="p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-zinc-700">
              Email or Mobile
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-10 sm:h-11 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-9 sm:pl-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-zinc-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="flex h-10 sm:h-11 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-9 sm:pl-10 pr-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 -m-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between pt-1 sm:pt-2">
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
              <label className="text-xs sm:text-sm font-medium text-zinc-600 select-none">
                Remember me
              </label>
            </div>
            <button
              onClick={onSwitchToForgotPassword}
              className="text-xs sm:text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-sm sm:text-base font-semibold w-full h-10 sm:h-11 bg-purple-600 text-white shadow-md hover:bg-purple-700 disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>

      <div className="text-center text-xs sm:text-sm text-zinc-500">
        Don't have an account?{" "}
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

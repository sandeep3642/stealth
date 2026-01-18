"use client";

import React, { useState } from "react";
import { AtSign, Lock, Eye, EyeOff, User, Phone, Gift } from "lucide-react";
import { registerUser } from "@/services/authService";

interface RegisterComponentProps {
  onSwitchToLogin: () => void;
}

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
  refferalCode?: string;
}

export const RegisterComponent: React.FC<RegisterComponentProps> = ({
  onSwitchToLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    mobileNo: "",
    countryCode: "+91",
    password: "",
    confirmPassword: "",
    refferalCode: "",
  });

  const countryCodes = [
    { code: "+91", country: "India" },
    { code: "+1", country: "USA/Canada" },
    { code: "+44", country: "UK" },
    { code: "+971", country: "UAE" },
  ];

  const handleChange = (field: keyof RegisterForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim())
      return (setError("First name is required"), false);
    if (!formData.lastName.trim())
      return (setError("Last name is required"), false);
    if (!formData.email.trim()) return (setError("Email is required"), false);
    if (!formData.mobileNo.trim())
      return (setError("Mobile number is required"), false);
    if (!formData.password) return (setError("Password is required"), false);
    if (formData.password.length < 6)
      return (setError("Password must be at least 6 characters"), false);
    if (formData.password !== formData.confirmPassword)
      return (setError("Passwords do not match"), false);
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      setError("");

      const { confirmPassword, ...registerData } = formData;
      await registerUser(registerData);

      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => onSwitchToLogin(), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] space-y-1 my-8">
      <h2 className="text-3xl font-bold text-zinc-900">Create Your Account</h2>
      <p className="text-zinc-500">Join us and start managing your system.</p>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
          {success}
        </div>
      )}

      {/* Form Fields */}
      {/* Example: First Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-700">
          First Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-purple-600"
            placeholder="John"
          />
        </div>
      </div>

      {/* Add remaining inputs here (same as your original code)... */}

      <button
        onClick={handleRegister}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md text-base font-semibold w-full h-11 mt-4 bg-purple-600 text-white shadow-md hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      <div className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="font-semibold text-purple-600 hover:underline"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

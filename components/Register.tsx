"use client";

import React, { useState } from "react";
import { AtSign, Lock, Eye, EyeOff, User, Phone, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
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
  const router = useRouter();

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Common country codes
  const countryCodes = [
    { code: "+91", country: "India" },
    { code: "+1", country: "USA/Canada" },
    { code: "+44", country: "UK" },
    { code: "+971", country: "UAE" },
    { code: "+61", country: "Australia" },
    { code: "+65", country: "Singapore" },
  ];

  // Handle form field change
  const handleChange = (field: keyof RegisterForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validate inputs
  const validateForm = (): boolean => {
    const { firstName, lastName, email, mobileNo, password, confirmPassword } =
      formData;

    if (!firstName.trim()) {
      toast.error("First name is required");
      return false;
    }
    if (!lastName.trim()) {
      toast.error("Last name is required");
      return false;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!mobileNo.trim()) {
      toast.error("Mobile number is required");
      return false;
    }
    if (!password) {
      toast.error("Password is required");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  // Submit form
  const handleRegister = async () => {
    // debugger
    if (!validateForm()){
      // toast.error("fill all fields");
       return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...registerData } = formData;

      await registerUser(registerData);
      toast.success("Registration successful! Redirecting to login...");

      setTimeout(() => {
        onSwitchToLogin();
        router.push("/");
      }, 1500);
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] space-y-2 my-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
          Create Your Account
        </h2>
        <p className="text-zinc-500">
          Join us and start managing your system with ease.
        </p>
      </div>

      {/* First Name */}
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
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
            placeholder="John"
          />
        </div>
      </div>

      {/* Last Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-700">Last Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
            placeholder="Doe"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-700">Email</label>
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Mobile Number */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-700">
          Mobile Number
        </label>
        <div className="flex gap-2">
          <select
            value={formData.countryCode}
            onChange={(e) => handleChange("countryCode", e.target.value)}
            className="flex h-10 w-24 rounded-md border border-zinc-200 bg-zinc-50 px-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
          >
            {countryCodes.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code}
              </option>
            ))}
          </select>
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <input
              type="tel"
              value={formData.mobileNo}
              onChange={(e) => handleChange("mobileNo", e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
              placeholder="1234567890"
            />
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-700">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-10 pr-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-700">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-10 pr-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Referral Code */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-700">
          Referral Code (Optional)
        </label>
        <div className="relative">
          <Gift className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input
            type="text"
            value={formData.refferalCode}
            onChange={(e) => handleChange("refferalCode", e.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
            placeholder="Enter code"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleRegister}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md text-base font-semibold w-full h-11 mt-4 bg-purple-600 text-white shadow-md hover:bg-purple-700 focus-visible:ring-1 focus-visible:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

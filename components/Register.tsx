"use client";

import React, { useState } from "react";
import { AtSign, Lock, Eye, EyeOff, User, Phone, Gift } from "lucide-react";
import { registerUser } from "@/services/authService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const countryCodes = [
    { code: "+91", country: "India" },
    { code: "+1", country: "USA/Canada" },
    { code: "+44", country: "UK" },
    { code: "+971", country: "UAE" },
    { code: "+61", country: "Australia" },
    { code: "+65", country: "Singapore" },
  ];

  const handleChange = (field: keyof RegisterForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
     if (mobileNo.length !== 10) {
      toast.error("Mobile number must be  10 characters");
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

 const handleRegister = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    setLoading(true);

    // optional loader delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const res = await registerUser(formData);

    // agar backend success true bheje
    if (res?.success) {
      toast.success("Registration successful!");
       setTimeout(() => {
        onSwitchToLogin();
      }, 500);
    } else {
      toast.error(res?.Message || "Registration failed");
    }

  } catch (err: any) {
    console.error("Registration error:", err);

    // ✅ AXIOS ERROR HANDLING
    if (err?.response?.data) {
      toast.error(err.response.data.Message || "Registration failed");
    } else {
      toast.error("Network error. Please try again.");
    }

  } finally {
    setLoading(false);
  }
};


  return (
    <div className="w-full h-full overflow-y-auto px-2">
      <div className="w-full max-w-md mx-auto py-4">
        <div className="space-y-4">
          
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Create Your Account
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Join us and start managing your system with ease
            </p>
          </div>

          {/* First Name */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="John"
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <div className="flex gap-2">
              <select
                value={formData.countryCode}
                onChange={(e) => handleChange("countryCode", e.target.value)}
                className="w-20 h-10 px-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              >
                {countryCodes.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code}
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  value={formData.mobileNo}
                  onChange={(e) => handleChange("mobileNo", e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="1234567890"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full h-10 pl-9 pr-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="w-full h-10 pl-9 pr-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              Referral Code <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="relative">
              <Gift className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={formData.refferalCode}
                onChange={(e) => handleChange("refferalCode", e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="Enter code"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full h-11 mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-98"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Login Link */}
          <div className="text-center text-xs sm:text-sm text-gray-600 pt-3 pb-2">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import { useState } from "react";
import { AtSign, Lock, Eye, EyeOff, User, Phone, Gift } from 'lucide-react';

// Register Component
export function RegisterComponent({ onSwitchToLogin }) {
 const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = () => {
    console.log('Register:', formData);
  };

  return (
    <div className="w-full max-w-[400px] space-y-1 my-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Create Your Account</h2>
        <p className="text-zinc-500">Join us and start managing your system with ease.</p>
      </div>

      <div className="space-y-1">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Full Name</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Email or Mobile</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <AtSign className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Mobile Number</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <Phone className="h-4 w-4" />
            </div>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleChange('mobile', e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Password</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 pr-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
              placeholder="••••••••"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Confirm Password</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 pr-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
              placeholder="••••••••"
            />
            <button
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Referral Code */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Referral Code (Optional)</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <Gift className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={formData.referralCode}
              onChange={(e) => handleChange('referralCode', e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
              placeholder="Enter code"
            />
          </div>
        </div>

        <button
          onClick={handleRegister}
          className="inline-flex items-center justify-center rounded-md text-base font-semibold transition-colors w-full h-11 mt-4 bg-purple-600 text-white shadow-md hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600"
        >
          Create Account
        </button>
      </div>

      <div className="text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <button 
          onClick={onSwitchToLogin}
          className="font-semibold text-purple-600 hover:underline underline-offset-4"
        >
          Log In
        </button>
      </div>
    </div>
  );
}
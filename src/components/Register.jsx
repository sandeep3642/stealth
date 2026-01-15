import { useState } from "react";
import { AtSign, Lock, Eye, EyeOff, User, Phone, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from "../pages/Auth/auth";

export function RegisterComponent({ onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    countryCode: '+91',
    password: '',
    confirmPassword: '',
    refferalCode: '' // Note: API uses 'refferalCode' with double 'f'
  });

  // Common country codes
  const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+61', country: 'Australia' },
    { code: '+971', country: 'UAE' },
    { code: '+65', country: 'Singapore' },
    { code: '+60', country: 'Malaysia' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+82', country: 'South Korea' },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.mobileNo.trim()) {
      setError('Mobile number is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      
      // Prepare data for API (remove confirmPassword as it's not needed)
      const { confirmPassword, ...registerData } = formData;
      
      const response = await registerUser(registerData);
      
      setSuccess('Registration successful! Redirecting to login...');
      
      // Wait 2 seconds then switch to login
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] space-y-1 my-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Create Your Account</h2>
        <p className="text-zinc-500">Join us and start managing your system with ease.</p>
      </div>

      <div className="space-y-1">
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

        {/* First Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">First Name</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
              placeholder="John"
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Last Name</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Email</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <AtSign className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Mobile Number with Country Code */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Mobile Number</label>
          <div className="flex gap-2">
            <select
              value={formData.countryCode}
              onChange={(e) => handleChange('countryCode', e.target.value)}
              className="flex h-10 w-24 rounded-md border border-zinc-200 bg-zinc-50 px-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
            >
              {countryCodes.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                value={formData.mobileNo}
                onChange={(e) => handleChange('mobileNo', e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
                placeholder="1234567890"
              />
            </div>
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
              value={formData.refferalCode}
              onChange={(e) => handleChange('refferalCode', e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
              placeholder="Enter code"
            />
          </div>
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-base font-semibold transition-colors w-full h-11 mt-4 bg-purple-600 text-white shadow-md hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
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
import { useState } from 'react';
import { AtSign, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login attempted with:', { email, password, rememberMe });
            navigate("/");

  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex w-1/2 relative bg-purple-600 items-center justify-center p-12 overflow-hidden text-white">
        <div className="relative z-20 flex flex-col items-center justify-center space-y-6">
          {/* Logo */}
          <div className="h-24 w-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
            <span className="text-6xl font-bold">S</span>
          </div>
          
          {/* Brand Text */}
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold tracking-tighter">StealthX</h1>
            <p className="text-lg text-white/80">Insight. Action. Impact.</p>
          </div>
        </div>
        
        {/* Background Blur Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Welcome Back</h2>
            <p className="text-zinc-500">Enter your credentials to access your account.</p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Email or Mobile</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    <AtSign className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 pl-10 pr-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus:border-purple-600"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                      rememberMe 
                        ? 'bg-purple-600 border-purple-600' 
                        : 'border-zinc-300 bg-white'
                    }`}
                  >
                    {rememberMe && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  <label 
                    onClick={() => setRememberMe(!rememberMe)}
                    className="text-sm font-medium leading-none cursor-pointer select-none text-zinc-600"
                  >
                    Remember me
                  </label>
                </div>
                <button className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
                  Forgot your password?
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="inline-flex items-center justify-center rounded-md text-base font-semibold transition-colors w-full h-11 bg-purple-600 text-white shadow-md hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600"
            >
              Login
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-zinc-500">
            Don't have an account?{' '}
            <button className="font-semibold text-purple-600 hover:underline underline-offset-4">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
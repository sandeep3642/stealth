import { useState } from 'react';
import { AtSign, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../pages/Auth/auth';

export function LoginComponent({ onSwitchToRegister }) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await loginUser(email, password);
      
      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      
      // Store user data if needed
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Welcome Back</h2>
        <p className="text-zinc-500">Enter your credentials to access your account.</p>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
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
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
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

        <button
          onClick={handleLogin}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-base font-semibold transition-colors w-full h-11 bg-purple-600 text-white shadow-md hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>

      <div className="text-center text-sm text-zinc-500">
        Don't have an account?{' '}
        <button 
          onClick={onSwitchToRegister}
          className="font-semibold text-purple-600 hover:underline underline-offset-4"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
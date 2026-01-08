import React, { useState } from 'react'
import { LoginComponent } from '../../components/Login';
import { RegisterComponent } from '../../components/Register';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
 // Main Auth Component
  const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
  const handleLoginSuccess = () => {
    if (onLogin) {
        navigate("/dashboard")
      onLogin();
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex w-1/2 relative bg-purple-600 items-center justify-center p-12 overflow-hidden text-white">
        <div className="relative z-20 flex flex-col items-center justify-center space-y-6">
          <div className="h-24 w-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
            <span className="text-6xl font-bold">S</span>
          </div>
          
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold tracking-tighter">StealthX</h1>
            <p className="text-lg text-white/80">Insight. Action. Impact.</p>
          </div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        {isLogin ? (
          <LoginComponent 
            onSwitchToRegister={() => setIsLogin(false)} 
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <RegisterComponent onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}


export default Auth

import React, { useState } from "react";
import { LoginComponent } from "../../components/Login";
import { RegisterComponent } from "../../components/Register";
import { useNavigate } from "react-router-dom";
import leftBanner from "../../assets/loginleftbanner.PNG";
const Auth = () => {
  // Main Auth Component
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const handleLoginSuccess = () => {
    if (onLogin) {
      navigate("/dashboard");
      onLogin();
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      {/* Card Wrapper */}
      <div className="flex w-[100%] max-w-6xl h-[85vh] bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex w-1/2 items-center justify-center rounded-l-2xl overflow-hidden">
          <img
            src={leftBanner}
            alt="leftbanner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 rounded-r-2xl">
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
    </div>
  );
};

export default Auth;

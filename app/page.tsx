"use client";

import React, { useState } from "react";
import Image from "next/image";

// ✅ Adjust these paths as per your project structure
import { LoginComponent } from "@/components/Login";
import { RegisterComponent } from "@/components/Register";

import leftBanner from "@/assets/loginleftbanner.png";

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Card Wrapper */}
      <div className="flex flex-col lg:flex-row w-full max-w-6xl min-h-[500px] lg:h-[85vh] bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center rounded-l-2xl overflow-hidden">
          <Image
            src={leftBanner}
            alt="Left Banner"
            className="w-full h-full object-cover"
            priority
          />
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-6 rounded-r-2xl overflow-y-auto">
          <div className="w-full max-w-md">
            {isLogin ? (
              <LoginComponent onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
              <RegisterComponent onSwitchToLogin={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

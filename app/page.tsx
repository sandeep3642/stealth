"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ✅ Adjust these paths as per your project structure
import { LoginComponent } from "@/components/Login";
import { RegisterComponent } from "@/components/Register";

import leftBanner from "@/assets/loginleftbanner.png";

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleLoginSuccess = () => {
    // Navigate to dashboard after login
    router.push("/dashboard");
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      {/* Card Wrapper */}
      <div className="flex w-full max-w-6xl h-[85vh] bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex w-1/2 items-center justify-center rounded-l-2xl overflow-hidden">
          <Image
            src={leftBanner}
            alt="Left Banner"
            className="w-full h-full object-cover"
            priority
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

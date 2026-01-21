// "use client";

// import React, { useState } from "react";
// import Image from "next/image";

// // ✅ Adjust these paths as per your project structure
// import { LoginComponent } from "@/components/Login";
// import { RegisterComponent } from "@/components/Register";

// import leftBanner from "@/assets/loginleftbanner.png";

// const Auth: React.FC = () => {
//   const [isLogin, setIsLogin] = useState(true);

//   return (
//     <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4 sm:p-6 lg:p-8">
//       {/* Card Wrapper */}
//       <div className="flex flex-col lg:flex-row w-full max-w-6xl min-h-[500px] lg:h-[85vh] bg-white shadow-xl rounded-2xl overflow-hidden">
//         {/* Left Panel */}
//         <div className="hidden lg:flex lg:w-1/2 items-center justify-center rounded-l-2xl overflow-hidden">
//           <Image
//             src={leftBanner}
//             alt="Left Banner"
//             className="w-full h-full object-cover"
//             priority
//           />
//         </div>

//         {/* Right Panel */}
//         <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-6 rounded-r-2xl overflow-y-auto">
//           <div className="w-full max-w-md">
//             {isLogin ? (
//               <LoginComponent onSwitchToRegister={() => setIsLogin(false)} />
//             ) : (
//               <RegisterComponent onSwitchToLogin={() => setIsLogin(true)} />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Auth;

"use client";

import React, { useState } from "react";
import { AtSign, Lock, Eye, EyeOff, User, Phone, Gift } from "lucide-react";
import { LoginComponent } from "@/components/Login";
import { RegisterComponent } from "@/components/Register";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Card Wrapper - Removed fixed height constraint */}
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Left Panel - Better image handling */}
        <div className="hidden lg:flex lg:w-1/2 relative min-h-[600px] bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
            <div className="space-y-6 text-center">
              <h1 className="text-4xl font-bold">Super Admin Portal</h1>
              <p className="text-lg text-purple-100">Manage, Monitor, and Maintain with Ultimate Control</p>
              <div className="grid grid-cols-3 gap-4 mt-12">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Improved scrolling */}
        <div className="w-full lg:w-1/2 flex items-start justify-center p-6 lg:p-8">
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
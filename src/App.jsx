import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useState } from "react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Fake login handler
  const handleLogin = () => setIsLoggedIn(true);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="/*"
          element={
            isLoggedIn ? (
              <ThemeProvider>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </ThemeProvider>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LayoutProvider } from "./context/LayoutContext";
import { ColorProvider } from "./context/ColorContext"; // Import from correct file
import Dashboard from "./pages/Dashboard/Dashboard";
import Accounts from "./pages/Accounts";
import { useState } from "react";
import Auth from "./pages/Auth";
import DualHeaderLayout from "./components/DualHeaderLayout";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogin = () => setIsLoggedIn(true);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <LayoutProvider>
          <ColorProvider>
            <Routes>
              <Route path="/" element={<Auth onLogin={handleLogin} />} />
              {isLoggedIn ? (
                <Route element={<DualHeaderLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/accounts" element={<Accounts />} />
                </Route>
              ) : (
                <Route path="*" element={<Navigate to="/" />} />
              )}
            </Routes>
          </ColorProvider>
        </LayoutProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LayoutProvider } from "@/context/LayoutContext";
import { ColorProvider } from "@/context/ColorContext";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/providers/ToastProvider"; // ✅ Import here
import type { ReactNode } from "react";

export const metadata = {
  title: "Agentix",
  description: "Next.js version of your React app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            <LayoutProvider>
              <ColorProvider>
                {children}
                <ToastProvider />
              </ColorProvider>
            </LayoutProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

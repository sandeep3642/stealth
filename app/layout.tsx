import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LayoutProvider } from "@/context/LayoutContext";
import { ColorProvider } from "@/context/ColorContext";
import { AuthProvider } from "@/context/AuthContext";
import type { ReactNode } from "react"; // ✅ Import ReactNode type

export const metadata = {
  title: "Stealth App",
  description: "Next.js version of your React app",
};

// ✅ Explicitly type the children prop
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            <LayoutProvider>
              <ColorProvider>{children}</ColorProvider>
            </LayoutProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

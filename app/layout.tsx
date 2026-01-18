import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LayoutProvider } from "@/context/LayoutContext";
import { ColorProvider } from "@/context/ColorContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Stealth App",
  description: "Next.js version of your React app",
};

export default function RootLayout({ children }) {
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

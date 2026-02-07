import "./globals.css";
import type { ReactNode } from "react";
import RootClientWrapper from "./RootClientWrapper";

export const metadata = {
  title: "Agentix",
  description: "Next.js version of your React app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootClientWrapper>{children}</RootClientWrapper>
      </body>
    </html>
  );
}

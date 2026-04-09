import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Velewera Clothing Store",
  description: "Premium clothing and accessories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Firebase CDN Scripts */}
        <Script 
          src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js" 
          strategy="beforeInteractive"
        />
        <Script 
          src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js" 
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

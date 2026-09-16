import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SimulateNotes // Research & Interactive Science Simulations",
  description:
    "SimulateNotes combines grounded deep research with live, AST-verified 60 FPS interactive science simulations powered by autonomous LangGraph agents and Tavily.",
  keywords: [
    "SimulateNotes",
    "Physics Simulation",
    "LangGraph",
    "GSAP",
    "React 18",
    "Tavily RAG",
    "Interactive Science",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="bg-black text-white antialiased selection:bg-white/20 selection:text-white">
        {children}
      </body>
    </html>
  );
}

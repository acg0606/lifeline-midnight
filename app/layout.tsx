import type { Metadata } from "next";
import { Manrope, DM_Serif_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const serif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Lifeline — apoio privado para recomeçar",
  description: "Círculos privados de recuperação financeira, verificados pela Midnight.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${serif.variable}`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

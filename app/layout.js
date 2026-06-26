import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata = {
  title: "E-Konseling - Platform Bimbingan Terpercaya",
  description: "Layanan bimbingan konseling digital yang aman, nyaman, dan profesional.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${outfit.variable} ${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

import type { Metadata,Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";
import "./refinement.css";
export const viewport:Viewport={themeColor:'#080e14'};
export const metadata: Metadata = { title: "BREATHE — A little perspective. A better breath.", description: "Air quality intelligence, a world of perspective, and the sound of somewhere new. Built for Lets Code Diwali Challenge 2026." };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><Providers>{children}</Providers></body></html>}

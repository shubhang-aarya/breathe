import type { Metadata,Viewport } from "next";
import localFont from "next/font/local";
const geist=localFont({src:"../../node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf",variable:"--font-geist",weight:"400",display:"swap"});
import { Providers } from "@/components/providers";
import "./globals.css";
import "./refinement.css";
export const viewport:Viewport={themeColor:'#080e14'};
export const metadata: Metadata = { title: "BREATHE — A little perspective. A better breath.", description: "Air quality intelligence, a world of perspective, and the sound of somewhere new. Built for Lets Code Diwali Challenge 2026." };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body className={geist.variable}><Providers>{children}</Providers></body></html>}

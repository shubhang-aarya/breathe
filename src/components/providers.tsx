"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useState } from "react";
export function Providers({children}:{children:React.ReactNode}){const [client]=useState(()=>new QueryClient({defaultOptions:{queries:{staleTime:15*60*1000,retry:2,refetchOnWindowFocus:false}}}));return <QueryClientProvider client={client}><MotionConfig reducedMotion="user">{children}</MotionConfig></QueryClientProvider>}

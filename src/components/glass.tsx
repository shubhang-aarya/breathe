"use client";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { DataKind } from "@/lib/data";
export function Glass({className="",...props}:HTMLMotionProps<"section">){return <motion.section className={`glass ${className}`} onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty("--pointer-x",`${e.clientX-r.left}px`);e.currentTarget.style.setProperty("--pointer-y",`${e.clientY-r.top}px`);}} {...props}/>;}
export function DataBadge({kind}:{kind:DataKind}){return <span className={`data-badge ${kind.toLowerCase()}`}>{kind === "STALE" ? "STALE · Not live" : kind}</span>}

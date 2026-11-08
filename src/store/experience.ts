import { create } from "zustand";
type Experience = { entered:boolean; lowPower:boolean; enter:()=>void; toggleLowPower:()=>void };
export const useExperience = create<Experience>((set)=>({entered:false,lowPower:false,enter:()=>set({entered:true}),toggleLowPower:()=>set(s=>({lowPower:!s.lowPower}))}));

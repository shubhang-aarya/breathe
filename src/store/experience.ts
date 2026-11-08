import { create } from "zustand";
type Experience = { breathing:boolean;entered:boolean; lowPower:boolean; enter:()=>void; toggleLowPower:()=>void };
export const useExperience = create<Experience>((set)=>({breathing:false,entered:false,lowPower:false,enter:()=>set({entered:true}),toggleLowPower:()=>set(s=>({lowPower:!s.lowPower}))}));

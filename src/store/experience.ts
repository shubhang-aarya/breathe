import { create } from "zustand";
type Experience = { radioRequest:number; requestRadio:()=>void; leave:()=>void; breathing:boolean;entered:boolean; lowPower:boolean; enter:()=>void; toggleLowPower:()=>void };
export const useExperience = create<Experience>((set)=>({radioRequest:0,requestRadio:()=>set(s=>({radioRequest:s.radioRequest+1})),leave:()=>set({entered:false,breathing:false,radioRequest:0}),breathing:false,entered:false,lowPower:false,enter:()=>set({entered:true}),toggleLowPower:()=>set(s=>({lowPower:!s.lowPower}))}));

'use client';
import { useQuery } from '@tanstack/react-query';
import type { Place } from './air';
import type { StationResult } from './openaq';
import { fetchSnapshot } from './offline-snapshot';
export function useStation(place: Place | null) {
 return useQuery({queryKey:['station-live-v1',place?.lat,place?.lon],queryFn:()=>fetchSnapshot<StationResult>(`/api/station?lat=${place!.lat}&lon=${place!.lon}`),enabled:!!place,retry:false,staleTime:60000,networkMode:'always',refetchInterval:60000,refetchOnWindowFocus:true});
}

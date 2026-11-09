import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen} from '@testing-library/react';
import {LiveReading} from './live-reading';
const {useStation}=vi.hoisted(()=>({useStation:vi.fn()}));
vi.mock('@/lib/use-station',()=>({useStation}));vi.mock('@/lib/use-clock',()=>({useClock:()=>Date.parse('2026-11-08T14:20:00Z')}));vi.mock('@/lib/use-offline',()=>({useOffline:()=>false}));vi.mock('./station-panel',()=>({StationPanel:()=>null}));
afterEach(()=>cleanup());
const place={name:'Riyadh',lat:24.714,lon:46.675};
it('does not substitute a model estimate for missing live station AQI',()=>{
 useStation.mockReturnValue({data:{status:'ok',station:{particleIndex:null,indexUnavailableReason:'Only old station data exists.'}},isPending:false,isError:false,isFetching:false});render(<LiveReading place={place}/>);expect(screen.getByText('Live AQI unavailable')).toBeVisible();expect(screen.getByText('Only old station data exists.')).toBeVisible();expect(screen.queryByText('413')).not.toBeInTheDocument();
});
it('shows a valid zero measured index with its particle-only method and timestamps',()=>{
 useStation.mockReturnValue({data:{status:'ok',station:{name:'Test station',source:'OpenAQ v3',provider:'Provider',distanceKm:1,fetchedAt:'2026-11-08T14:15:00Z',particleIndex:{aqi:0,aboveScale:false,observedAt:'2026-11-08T14:00:00Z',basis:['pm25'],hoursUsed:12,method:'EPA particle NowCast (2024 breakpoints)'}}},isPending:false,isError:false,isFetching:false});render(<LiveReading place={place}/>);expect(screen.getByText('0')).toBeVisible();expect(screen.getByText(/Particle AQI \(US\)/)).toBeVisible();expect(screen.getByText(/not an official all-pollutant city AQI/)).toBeVisible();
});

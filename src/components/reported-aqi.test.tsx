import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen} from '@testing-library/react';
import {ReportedAQI} from './reported-aqi';
const {useQuery}=vi.hoisted(()=>({useQuery:vi.fn()}));
vi.mock('@tanstack/react-query',()=>({useQuery}));
vi.mock('@/lib/use-clock',()=>({useClock:()=>Date.parse('2026-11-09T01:20:00Z')}));
vi.mock('@/lib/use-offline',()=>({useOffline:()=>false}));
afterEach(()=>cleanup());
const reading={aqi:0,station:'Station',distanceKm:1,observedAt:'2026-11-09T01:00:00Z',fetchedAt:'2026-11-09T01:10:00Z',url:'https://example.org/station',attribution:[{name:'Originating provider',url:'https://example.org/'}],subindices:{pm25:0}};
const show=()=>render(<ReportedAQI place={{name:'Place',lat:28.61,lon:77.21}} fallback={<p>OpenAQ fallback</p>}/>);
it('shows a fresh reported zero with source attribution and no concentration units',()=>{useQuery.mockReturnValue({data:{status:'ok',reading},isPending:false,isError:false});show();expect(screen.getByText('0')).toBeVisible();expect(screen.getByText(/Provider-reported/)).toBeVisible();expect(screen.getByRole('link',{name:'Originating provider'})).toHaveAttribute('href','https://example.org/');expect(screen.queryByText('OpenAQ fallback')).toBeNull();});
it('falls back instead of presenting an old reported AQI as live',()=>{useQuery.mockReturnValue({data:{status:'ok',reading:{...reading,observedAt:'2026-11-08T01:00:00Z'}},isPending:false,isError:false});show();expect(screen.getByText('OpenAQ fallback')).toBeVisible();expect(screen.queryByText('0')).toBeNull();expect(screen.getByText(/excluded from the current AQI/)).toBeInTheDocument();});
it('does not break the OpenAQ path when the additional source is unconfigured',()=>{useQuery.mockReturnValue({data:{status:'unconfigured'},isPending:false,isError:false});show();expect(screen.getByText('OpenAQ fallback')).toBeVisible();});

it("keeps regional reports out of the local headline",()=>{useQuery.mockReturnValue({data:{status:"ok",reading:{...reading,distanceKm:87}},isPending:false,isError:false});show();expect(screen.getByText("OpenAQ fallback")).toBeVisible();expect(screen.queryByRole("heading",{name:"Nearest regional station AQI"})).toBeNull();expect(screen.getByText(/Regional reference only/)).toBeInTheDocument();expect(screen.getByText(/87.0 km from pin/)).toBeVisible();});
it("shows WAQI coverage status and a WAQI retry alongside the separate fallback",()=>{useQuery.mockReturnValue({data:{status:"unavailable"},isPending:false,isError:false});show();expect(screen.getByText(/No usable current report was returned/)).toBeVisible();expect(screen.getByRole("button",{name:"Refresh current AQI"})).toBeVisible();});

it("labels a very distant source as a distant station reference rather than local AQI",()=>{useQuery.mockReturnValue({data:{status:"ok",reading:{...reading,distanceKm:740}},isPending:false,isError:false});show();expect(screen.getByText("OpenAQ fallback")).toBeVisible();expect(screen.getByText(/740.0 km from pin/)).toBeVisible();expect(screen.getByText(/not a measurement at your pin/)).toBeInTheDocument();});

it('identifies a nearby IQAir city report and missing pollutants',()=>{useQuery.mockReturnValue({data:{status:'ok',reading:{...reading,source:'IQAir',scope:'city',subindices:{}}},isPending:false,isError:false});show();expect(screen.getByRole('heading',{name:'Latest reported city AQI'})).toBeVisible();expect(screen.getByText(/City-level report/)).toBeVisible();expect(screen.getByText(/Community plan does not provide/)).toBeInTheDocument()});

import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PanelNavigation } from './panel-navigation';
import { useRadioNavigation } from '@/lib/use-radio-navigation';
import { useExperience } from '@/store/experience';
vi.mock('./liquid-buttons',()=>({LiquidButtons:({children,...props}:React.HTMLAttributes<HTMLDivElement>)=><div {...props}>{children}</div>}));
afterEach(()=>{cleanup();useExperience.setState({radioRequest:0});vi.unstubAllGlobals()});
it('provides an explicit back action without changing the selected screen itself',()=>{
 const back=vi.fn();render(<PanelNavigation onBack={back}/>);fireEvent.click(screen.getByRole('button',{name:'Back to globe'}));expect(back).toHaveBeenCalledOnce();expect(useExperience.getState().radioRequest).toBe(0);
});
it('closes panels, scrolls to radio and moves keyboard focus after modal cleanup',()=>{
 const frames:FrameRequestCallback[]=[];vi.stubGlobal('requestAnimationFrame',(callback:FrameRequestCallback)=>{frames.push(callback);return frames.length});vi.stubGlobal('cancelAnimationFrame',vi.fn());vi.stubGlobal('matchMedia',()=>({matches:true}));
 const close=vi.fn();function Harness(){useRadioNavigation(close);return <><PanelNavigation onBack={close}/><section id="local-radio-player" tabIndex={-1} aria-label="Local radio player"/></>}
 render(<Harness/>);const player=screen.getByRole('region',{name:'Local radio player'}),scroll=vi.fn();player.scrollIntoView=scroll;
 fireEvent.click(screen.getByRole('button',{name:'Radio'}));expect(close).toHaveBeenCalled();
 act(()=>{frames.shift()?.(0)});act(()=>{frames.shift()?.(16)});
 expect(player).toHaveFocus();expect(scroll).toHaveBeenCalledWith({behavior:'instant',block:'center'});
});

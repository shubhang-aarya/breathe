import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Experience } from './experience';
import { useExperience } from '../store/experience';
vi.mock('./planet',()=>({Planet:()=> <div aria-hidden="true"/>}));
vi.mock('./explorer',()=>({Explorer:()=> <h1>Explorer ready</h1>}));
vi.mock('framer-motion',async()=>{const React=await import('react');return {AnimatePresence:({children}:{children:React.ReactNode})=>children,motion:new Proxy({},{get:(_,tag:string)=>React.forwardRef(function Mock({children,initial,animate,exit,transition,...props}:Record<string,unknown>,ref){void initial;void animate;void exit;void transition;return React.createElement(tag,{...props,ref},children as React.ReactNode)})})}});
afterEach(()=>{cleanup();useExperience.setState({entered:false,lowPower:false})});
describe('entry experience',()=>{
 it('enters without requiring audio',()=>{render(<Experience/>);fireEvent.click(screen.getByRole('button',{name:/Enter BREATHE/}));expect(screen.getByRole('heading',{name:'Explorer ready'})).toBeVisible()});
 it('opens credits and closes with Escape',()=>{render(<Experience/>);fireEvent.click(screen.getByRole('button',{name:'Data and credits'}));expect(screen.getByRole('dialog')).toBeVisible();expect(screen.getByRole('button',{name:'Close data and credits'})).toHaveFocus();fireEvent.keyDown(document,{key:'Escape'});expect(screen.queryByRole('dialog')).not.toBeInTheDocument()});
});

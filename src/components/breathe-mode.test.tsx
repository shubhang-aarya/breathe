import React from 'react';
import { afterEach,expect,it,vi } from 'vitest';
import { cleanup,fireEvent,render,screen } from '@testing-library/react';
import { BreatheMode } from './breathe-mode';
import { useExperience } from '@/store/experience';
vi.mock('framer-motion',()=>({useReducedMotion:()=>true,motion:{div:({animate,transition,...props}:Record<string,unknown>)=>{void animate;void transition;return <div {...props}/>}}}));
afterEach(()=>cleanup());
it('ducks radio while open, supports duration and keyboard exit, restores audio on unmount',()=>{const close=vi.fn();const {unmount}=render(<BreatheMode onClose={close}/>);expect(useExperience.getState().breathing).toBe(true);fireEvent.change(screen.getByRole('combobox'),{target:{value:'3'}});expect(screen.getByText('180 seconds remaining')).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'Begin'}));expect(screen.getByRole('heading',{name:'Breathe in'})).toBeVisible();fireEvent.keyDown(screen.getByRole('dialog'),{key:'Escape'});expect(close).toHaveBeenCalled();unmount();expect(useExperience.getState().breathing).toBe(false)});

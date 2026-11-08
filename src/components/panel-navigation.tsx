'use client';
import type { Ref } from 'react';
import { ArrowLeft, Radio } from 'lucide-react';
import { useExperience } from '@/store/experience';
import { LiquidButtons } from './liquid-buttons';
export function PanelNavigation({ onBack, backRef }: { onBack: () => void; backRef?: Ref<HTMLButtonElement> }) {
  const requestRadio = useExperience(s => s.requestRadio);
  return <LiquidButtons className="panel-navigation" role="navigation" aria-label="Panel navigation"><button ref={backRef} className="quiet-button" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" />Back to globe</button><button className="quiet-button" aria-controls="local-radio-player" onClick={() => { onBack(); requestRadio(); }}><Radio size={16} aria-hidden="true" />Radio</button></LiquidButtons>;
}

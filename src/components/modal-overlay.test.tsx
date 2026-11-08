import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ModalOverlay } from './modal-overlay';
afterEach(() => { cleanup(); document.body.style.overflow = ''; });
it('mounts above the app instead of inside transformed globe ancestors and restores page scrolling', () => {
  document.body.style.overflow = 'auto';
  const { unmount } = render(<div data-testid="globe-ancestor" style={{ transform: 'translateY(0)', isolation: 'isolate' }}><ModalOverlay onClose={() => {}}><section role="dialog" aria-label="Diwali window">Content</section></ModalOverlay></div>);
  const dialog = screen.getByRole('dialog', { name: 'Diwali window' });
  expect(dialog.parentElement?.parentElement).toBe(document.body);
  expect(screen.getByTestId('globe-ancestor')).not.toContainElement(dialog);
  expect(document.body.style.overflow).toBe('hidden');
  unmount(); expect(document.body.style.overflow).toBe('auto');
});
it('dismisses only on the backdrop, leaving panel controls independent', () => {
  const close = vi.fn();
  render(<ModalOverlay onClose={close}><section role="dialog"><button>Panel action</button></section></ModalOverlay>);
  fireEvent.mouseDown(screen.getByRole('button')); expect(close).not.toHaveBeenCalled();
  fireEvent.mouseDown(screen.getByRole('dialog').parentElement!); expect(close).toHaveBeenCalledOnce();
});

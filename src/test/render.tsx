import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@/context/ThemeContext';

function AllProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

export function render(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return rtlRender(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';


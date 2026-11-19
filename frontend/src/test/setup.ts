import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// RTL auto-cleanup no se registra con `globals: false`, así que lo hacemos explícito.
afterEach(() => {
  cleanup();
});

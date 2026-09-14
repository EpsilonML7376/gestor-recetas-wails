/**
 * Normalizes an unknown error value into a human-readable message.
 *
 * Wails IPC rejects with plain strings, while runtime failures reject with
 * `Error` instances. Anything else falls back to a generic message.
 */
export function getErrorMessage(e: unknown): string {
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  return 'Error desconocido';
}

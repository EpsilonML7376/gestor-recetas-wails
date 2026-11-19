import type { Page } from '@playwright/test';

/**
 * Inyecta un backend falso (`window.go`) en el navegador.
 *
 * Wails inyecta `window.go` solo dentro del WebView2 nativo, no en un
 * navegador común. Para el E2E en Chromium, simulamos ese backend con estado
 * en memoria, replicando el contrato de los servicios bindeados.
 */
export async function installWailsMock(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const clientes = [
      { id: 1, nombre: 'Juan', apellido: 'Perez', dni: '12345678', telefono: '' },
    ];
    let nextId = 2;

    (window as any).go = {
      services: {
        ClienteService: {
          GetAll: () => Promise.resolve({ data: clientes, total: clientes.length }),
          GetByID: (id: number) => Promise.resolve(clientes.find((c) => c.id === id)),
          Create: (c: any) => {
            const created = { ...c, id: nextId++ };
            clientes.push(created);
            return Promise.resolve(created);
          },
          Update: () => Promise.resolve(),
          Delete: (id: number) => {
            const i = clientes.findIndex((c) => c.id === id);
            if (i >= 0) clientes.splice(i, 1);
            return Promise.resolve();
          },
        },
        DoctorService: {
          GetAll: () => Promise.resolve({ data: [], total: 0 }),
          GetByID: () => Promise.resolve({ id: 1, nombre: 'Doc', apellido: 'X' }),
          Create: (d: any) => Promise.resolve({ ...d, id: 1 }),
          Update: () => Promise.resolve(),
          Delete: () => Promise.resolve(),
        },
        MutualService: {
          GetAll: () => Promise.resolve({ data: [], total: 0 }),
          GetByID: () => Promise.resolve({ id: 1, nombre: 'Mutual' }),
          Create: (d: any) => Promise.resolve({ ...d, id: 1 }),
          Update: () => Promise.resolve(),
          Delete: () => Promise.resolve(),
        },
        RecetaService: {
          GetAll: () => Promise.resolve({ data: [], total: 0 }),
          GetByID: () =>
            Promise.resolve({ id: 1, fecha: new Date().toISOString(), tieneMutual: false }),
          Create: (d: any) => Promise.resolve({ ...d, id: 1 }),
          Update: () => Promise.resolve(),
          Delete: () => Promise.resolve(),
          GetTotal: () => Promise.resolve(0),
        },
      },
      main: {
        App: { Greet: (name: string) => `Hello ${name}` },
      },
    };
  });
}

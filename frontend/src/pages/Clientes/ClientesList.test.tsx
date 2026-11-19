import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/testUtils';

vi.mock('../../hooks/useClientes', () => ({
  useClientes: vi.fn(),
  useDeleteCliente: () => ({ mutateAsync: vi.fn() }),
}));

import { useClientes } from '../../hooks/useClientes';
import { ClientesList } from './ClientesList';

describe('ClientesList', () => {
  it('renderiza los clientes devueltos por el backend', () => {
    vi.mocked(useClientes).mockReturnValue({
      data: {
        data: [
          { id: 1, nombre: 'Juan', apellido: 'Perez', dni: '12345678', telefono: '' },
          { id: 2, nombre: 'Ana', apellido: 'Gomez', dni: '87654321', telefono: '5551234' },
        ],
        total: 2,
      },
      isLoading: false,
    } as any);

    renderWithProviders(<ClientesList />);

    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('Perez')).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Gomez')).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay clientes', () => {
    vi.mocked(useClientes).mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
    } as any);

    renderWithProviders(<ClientesList />);

    expect(screen.getByText('No se encontraron clientes')).toBeInTheDocument();
  });
});

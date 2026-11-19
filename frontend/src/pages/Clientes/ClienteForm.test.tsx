import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/testUtils';

const createMutate = vi.fn();
const updateMutate = vi.fn();

vi.mock('../../hooks/useClientes', () => ({
  useClientes: () => ({ data: { data: [], total: 0 }, isLoading: false }),
  useCliente: () => ({ data: undefined, isLoading: false }),
  useCreateCliente: () => ({ mutateAsync: createMutate, isPending: false }),
  useUpdateCliente: () => ({ mutateAsync: updateMutate, isPending: false }),
}));

import { ClienteForm } from './ClienteForm';

describe('ClienteForm', () => {
  beforeEach(() => {
    createMutate.mockReset();
    updateMutate.mockReset();
  });

  it('no guarda si faltan nombre o apellido (validación bloquea el submit)', async () => {
    renderWithProviders(<ClienteForm />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Guardar Cliente/i }));

    expect(createMutate).not.toHaveBeenCalled();
  });

  it('llama a createCliente.mutateAsync con los datos al guardar', async () => {
    createMutate.mockResolvedValue({ id: 1 });
    renderWithProviders(<ClienteForm />);
    const user = userEvent.setup();

    await user.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Juan');
    await user.type(screen.getByRole('textbox', { name: 'Apellido' }), 'Perez');
    await user.click(screen.getByRole('button', { name: /Guardar Cliente/i }));

    expect(createMutate).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Juan', apellido: 'Perez' }),
    );
  });
});

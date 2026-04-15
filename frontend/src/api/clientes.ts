import { GetAll, GetByID, Create, Update, Delete } from '../../wailsjs/go/services/ClienteService';
import { models, dto, repositories } from '../../wailsjs/go/models';

export const clientesApi = {
  getAll: async (filters?: repositories.ClienteFilters): Promise<dto.PaginatedClientes> => {
    return await GetAll(filters || new repositories.ClienteFilters());
  },

  getById: async (id: number): Promise<models.Cliente> => {
    return await GetByID(id);
  },

  create: async (data: models.Cliente): Promise<models.Cliente> => {
    return await Create(data);
  },

  update: async (id: number, data: models.Cliente): Promise<void> => {
    await Update(id, data);
  },

  delete: async (id: number): Promise<void> => {
    await Delete(id);
  },
};

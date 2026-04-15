import { GetAll, GetByID, Create, Update, Delete, GetTotal } from '../../wailsjs/go/services/RecetaService';
import { models, repositories, dto } from '../../wailsjs/go/models';

export const recetasApi = {
  getAll: async (filters?: repositories.RecetaFilters): Promise<dto.PaginatedRecetas> => {
    return await GetAll(filters || new repositories.RecetaFilters());
  },

  getById: async (id: number): Promise<models.Receta> => {
    return await GetByID(id);
  },

  create: async (data: models.Receta): Promise<models.Receta> => {
    return await Create(data);
  },

  update: async (id: number, data: models.Receta): Promise<void> => {
    await Update(id, data);
  },

  delete: async (id: number): Promise<void> => {
    await Delete(id);
  },

  getTotal: async (id: number): Promise<{ total: number }> => {
    const total = await GetTotal(id);
    return { total };
  },
};

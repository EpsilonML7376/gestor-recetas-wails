import { GetAll, GetByID, Create, Update, Delete } from '../../wailsjs/go/services/MutualService';
import { models, dto, repositories } from '../../wailsjs/go/models';

export const mutualesApi = {
  getAll: async (filters?: repositories.MutualFilters): Promise<dto.PaginatedMutuales> => {
    return await GetAll(filters || new repositories.MutualFilters());
  },

  getById: async (id: number): Promise<models.Mutual> => {
    return await GetByID(id);
  },

  create: async (data: models.Mutual): Promise<models.Mutual> => {
    return await Create(data);
  },

  update: async (id: number, data: models.Mutual): Promise<void> => {
    await Update(id, data);
  },

  delete: async (id: number): Promise<void> => {
    await Delete(id);
  },
};

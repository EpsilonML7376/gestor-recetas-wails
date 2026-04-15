import { GetAll, GetByID, Create, Update, Delete } from '../../wailsjs/go/services/DoctorService';
import { models, dto, repositories } from '../../wailsjs/go/models';

export const doctoresApi = {
  getAll: async (filters?: repositories.DoctorFilters): Promise<dto.PaginatedDoctores> => {
    return await GetAll(filters || new repositories.DoctorFilters());
  },

  getById: async (id: number): Promise<models.Doctor> => {
    return await GetByID(id);
  },

  create: async (data: models.Doctor): Promise<models.Doctor> => {
    return await Create(data);
  },

  update: async (id: number, data: models.Doctor): Promise<void> => {
    await Update(id, data);
  },

  delete: async (id: number): Promise<void> => {
    await Delete(id);
  },
};

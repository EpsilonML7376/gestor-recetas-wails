export interface Doctor {
  id: number;
  nombre: string;
  apellido: string;
}

export interface DoctorInput {
  nombre: string;
  apellido: string;
}

export interface DoctorFilters {
  limit?: number;
  offset?: number;
  search?: string;
}


export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
}

export interface ClienteInput {
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
}

export interface ClienteFilters {
  limit?: number;
  offset?: number;
  search?: string;
}


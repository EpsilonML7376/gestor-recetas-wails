export interface Mutual {
  id: number;
  nombre: string;
}

export interface MutualInput {
  nombre: string;
}

export interface MutualFilters {
  limit?: number;
  offset?: number;
  search?: string;
}


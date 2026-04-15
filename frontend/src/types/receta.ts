import { Cliente } from './cliente';
import { Doctor } from './doctor';
import { Mutual } from './mutual';

export interface Graduacion {
  id?: number;
  tipoDistancia: 'lejos' | 'cerca';
  ojo: 'derecho' | 'izquierdo';
  esf?: number | null;
  cil?: number | null;
  grados?: number | null;
  recetaId?: number;
}

export interface Receta {
  id: number;
  fecha: string;
  notas?: string;
  tieneMutual: boolean;
  lenteCristalTipo?: string;
  lenteCristalPrecio: number;
  lenteArmazonTipo?: string;
  lenteArmazonPrecio: number;
  total: number;
  clienteId: number;
  doctorId: number;
  mutualId?: number;
  cliente?: Cliente;
  doctor?: Doctor;
  mutual?: Mutual;
  graduaciones?: Graduacion[];
}

export interface RecetaInput {
  fecha: string;
  notas?: string;
  tieneMutual: boolean;
  lenteCristalTipo?: string;
  lenteCristalPrecio: number;
  lenteArmazonTipo?: string;
  lenteArmazonPrecio: number;
  clienteId: number;
  doctorId: number;
  mutualId?: number;
  graduaciones: Graduacion[];
}

export interface RecetaFilters {
  limit?: number;
  offset?: number;
  clienteId?: number;
  doctorId?: number;
  mutualId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}


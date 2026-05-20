export interface Puesto {
  num: string;
  nombre: string;
  pmId?: number;
  actIds?: number[];
}

export interface PDV {
  id: number;
  nombre: string;
  codigo: string;
  distrito: string;
  tipo: string;
  estado: 'Activo' | 'Inactivo';
  mercaderista: string;
  visitas: number;
  pendiente: boolean;
  puestos: Puesto[];
}

export interface Storecheck {
  id: number;
  pdv: string;
  puesto: string;
  fecha: string;
  mercaderista: string;
  estado: 'Completado' | 'En Proceso' | 'Pendiente';
  skus: number;
  foto: boolean;
  actividad: string;
  observaciones: string;
  pmId?: number;
  reporte?: string;
}

export interface Actividad {
  id: number;
  nombre: string;
  tipo: 'Descuento' | 'Exhibición' | 'Mixta';
  estado: 'Vigente' | 'Caducada';
  inicio: string;
  fin: string;
  skuIds: number[];
  descripcion: string;
}

export interface SKU {
  id: number;
  codigo: string;
  nombre: string;
  marca: string;
  categoria: string;
  activo: boolean;
}

export interface SKUForm extends SKU {
  stockInicial?: string | number;
  stockFinal?: string | number;
  tieneActividad?: boolean;
}

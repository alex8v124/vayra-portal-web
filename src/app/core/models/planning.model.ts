export interface Planning {
  planningId?: number;
  usuarioId: number;
  pdvId: number;
  pmIds: string; // Lista de IDs de puestos de mercado separados por comas, ej: "1,2"
  actIds: string; // Lista de IDs de actividades promocionales asignadas, ej: "10,11"
  fechaInicio: string;
  fechaFin: string;
  estado: string; // "Pendiente" | "Completado"

  // Campos extendidos devueltos por el backend para visualización
  mercaderistaName?: string;
  pdvNombre?: string;
}

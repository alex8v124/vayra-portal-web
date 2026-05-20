export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'analista' | 'mercaderista' | 'supervisor';
  password?: string;
  status: 'Activo' | 'Inactivo';
  equipoComercial?: string;
}

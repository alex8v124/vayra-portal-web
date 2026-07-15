export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'analista' | 'controller' | 'supervisor' | 'mercaderista' | 'gerente' | string;
  password?: string;
  status: 'Activo' | 'Inactivo';
  equipoComercial?: string;
  pdvsAsignados?: string;
}

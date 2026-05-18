export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'analista' | 'mercaderista';
  password?: string;
  status: 'Activo' | 'Inactivo';
}

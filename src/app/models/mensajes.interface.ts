
export interface Usuario {
  id: string;
  email: string;
  nombre?: string;
  apellido?: string;
  edad?: number;
}

export interface Mensaje {
  id: number;
  contenido: string;
  id_usuario: string;
  usuarios?: Usuario;
  created_at: string
}


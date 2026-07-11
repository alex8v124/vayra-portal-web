import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cronograma {
  id?: number;
  nombre: string;
  planningIds: string;
  fechaInicio?: string;
  fechaFin?: string;
  datosJson: string; // JSON with generated visits
}

@Injectable({
  providedIn: 'root'
})
export class CronogramaService {
  private apiUrl = 'http://localhost:8080/api/cronogramas';

  constructor(private http: HttpClient) {}

  listar(): Observable<Cronograma[]> {
    return this.http.get<Cronograma[]>(this.apiUrl);
  }

  guardar(cronograma: Cronograma): Observable<Cronograma> {
    return this.http.post<Cronograma>(this.apiUrl, cronograma);
  }

  actualizar(id: number, cronograma: Cronograma): Observable<Cronograma> {
    return this.http.put<Cronograma>(`${this.apiUrl}/${id}`, cronograma);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

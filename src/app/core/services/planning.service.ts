import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface Planning {
  id?: number;
  nombre: string;
  datosJson: string; // JSON with array of { mercado, dex, ciudad, stands: [{ puesto, encargado, diaSemana }] }
}

@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  private apiUrl = `${environment.apiUrl}/api/planrutas`;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { }

  listar(): Observable<Planning[]> {
    if (isPlatformBrowser(this.platformId)) {
      return this.http.get<Planning[]>(this.apiUrl);
    }
    return of([]);
  }

  guardar(planning: Planning): Observable<Planning> {
    return this.http.post<Planning>(this.apiUrl, planning);
  }

  actualizar(id: number, planning: Planning): Observable<Planning> {
    return this.http.put<Planning>(`${this.apiUrl}/${id}`, planning);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

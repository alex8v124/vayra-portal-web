import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorecheckProcessorService {
  private apiUrl = `${environment.apiUrl}/api/storecheck`;

  constructor(private http: HttpClient) {}

  processStorecheck(file: File, configJson: string): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('config', configJson);

    return this.http.post(`${this.apiUrl}/process`, formData, {
      responseType: 'blob'
    });
  }
}

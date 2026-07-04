import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private http = inject(HttpClient);
  // Asegúrate que el puerto coincida (7105)
  private apiUrl = `${environment.apiUrl}/Images/upload`;

  upload(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    // No necesitamos headers manuales aquí para el Content-Type, 
    // Angular lo detecta automáticamente al ser FormData.
    // Si tu backend pide token para subir fotos, agrega los headers de auth aquí.
    return this.http.post<any>(this.apiUrl, formData);
  }
}
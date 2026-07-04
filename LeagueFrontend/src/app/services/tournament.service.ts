import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TournamentService {
  private apiUrl = `${environment.apiUrl}/Tournaments`;
  private http = inject(HttpClient);

  // Helper para enviar el Token
  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });
  }

  // 👇 Ahora enviamos headers aquí también para evitar errores 401
  getAll(): Observable<any[]> { 
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }); 
  }

  create(data: any): Observable<any> { 
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() }); 
  }

  update(id: string, data: any): Observable<any> { 
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() }); 
  }
  
  delete(id: string): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }); 
  }
}
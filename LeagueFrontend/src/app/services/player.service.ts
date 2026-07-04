import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private apiUrl = `${environment.apiUrl}/Players`; 
  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener jugadores de un equipo específico
  getPlayersByTeam(teamId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ByTeam/${teamId}`, { headers: this.getHeaders() });
  }

  createPlayer(player: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, player, { headers: this.getHeaders() });
  }

  updatePlayer(id: string, player: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, player, { headers: this.getHeaders() });
  }

  deletePlayer(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
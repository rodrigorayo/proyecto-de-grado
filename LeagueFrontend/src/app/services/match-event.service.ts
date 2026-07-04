import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MatchEventService {
  private apiUrl = `${environment.apiUrl}/MatchEvents`;
  private http = inject(HttpClient);

  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });
  }

  // Registrar un evento (Gol/Tarjeta)
  addEvent(matchId: string, playerId: string, type: number, minute: number): Observable<any> {
    const body = { matchId, playerId, type, minute };
    return this.http.post(this.apiUrl, body, { headers: this.getHeaders() });
  }

  // Obtener historial del partido (Para listar abajo del form)
  getEventsByMatch(matchId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ByMatch/${matchId}`, { headers: this.getHeaders() });
  }

  // Tabla de Goleadores (Para la vista pública después)
  getTopScorers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/TopScorers`);
  }
}
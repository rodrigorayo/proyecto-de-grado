import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ MANTENEMOS TU INTERFAZ ORIGINAL
export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName?: string;
  awayTeamName?: string;
  matchDate: string;
  venue?: string;
  status: number;
  homeScore?: number;
  awayScore?: number;
  chronicle?: string; // 👈 Agregué esto opcional por si quieres usar el tipado estricto luego
  incidents?: string; // 👈 Agregué esto opcional
}

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7105/api/Matches'; 

  // Helper para el token
  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });
  }

  // --- LECTURA (Mantenemos tu lógica: Público, sin headers obligatorios) ---
  getMatchesByTournament(tournamentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ByTournament/${tournamentId}`);
  }

  // --- ADMIN (Requiere Token) ---
  createMatch(matchData: any): Observable<any> {
    return this.http.post(this.apiUrl, matchData, { headers: this.getHeaders() });
  }

  // --- COMITÉ (Requiere Token) ---
  updateMatchResult(matchId: string, resultData: any): Observable<any> {
    // resultData espera: { matchId, homeScore, awayScore, incidents }
    // Nota: Tu backend espera la ruta "/Result" (Case sensitive a veces importa, lo dejé como lo tenías)
    return this.http.put(`${this.apiUrl}/${matchId}/Result`, resultData, { headers: this.getHeaders() });
  }

  // Adaptador para compatibilidad (Lo mantenemos tal cual)
  registerResult(matchId: string, homeScore: number, awayScore: number): Observable<any> {
    const command = {
      matchId: matchId,
      homeScore: homeScore,
      awayScore: awayScore,
      incidents: 'Carga rápida Admin'
    };
    return this.updateMatchResult(matchId, command);
  }

  // 👇👇 NUEVO MÉTODO AGREGADO PARA LA IA 👇👇
  generateChronicle(matchId: string): Observable<any> {
    // El segundo parámetro {} es el body vacío, necesario para un POST
    return this.http.post(`${this.apiUrl}/${matchId}/generate-chronicle`, {}, { headers: this.getHeaders() });
  }

  updateChronicle(matchId: string, chronicle: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${matchId}/Chronicle`, { matchId, chronicle }, { headers: this.getHeaders() });
  }
}
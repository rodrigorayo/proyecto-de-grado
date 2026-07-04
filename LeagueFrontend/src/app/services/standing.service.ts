import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StandingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Standings`;

  // ⚠️ CAMBIO: Quitamos los headers de autenticación porque es una vista PÚBLICA.
  // Los fans no tienen token, así que si lo enviamos, fallará.
  getStandings(tournamentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${tournamentId}`);
  }
}
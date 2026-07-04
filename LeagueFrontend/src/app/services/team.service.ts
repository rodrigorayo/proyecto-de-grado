import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/Teams`;
  private http = inject(HttpClient);

  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });
  }

  // 👇 AQUÍ ESTABA EL ERROR: Renombrado de getAll() a getTeams()
  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Métodos que usa tu Admin Dashboard (NO TOCAR)
  createTeam(team: any): Observable<any> {
    return this.http.post(this.apiUrl, team, { headers: this.getHeaders() });
  }

  updateTeam(id: string, team: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, team, { headers: this.getHeaders() });
  }

  deleteTeam(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
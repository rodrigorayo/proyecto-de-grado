import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7105/api/Predictions'; // Ajusta tu puerto

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // 👇 Este es el método para que el Admin consulte a la IA
  analyzeMatch(matchId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/Analyze/${matchId}`, { headers: this.getHeaders() });
  }

  // 👇 Este será para cuando los usuarios voten (lo usaremos después)
  submitPrediction(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() });
  }
}
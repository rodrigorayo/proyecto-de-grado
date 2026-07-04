import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LandingSetting } from '../models/landing-setting.model';

@Injectable({
  providedIn: 'root'
})
export class LandingSettingsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7105/api/LandingSettings';

  getSettings(): Observable<LandingSetting> {
    return this.http.get<LandingSetting>(this.apiUrl);
  }

  updateSettings(data: LandingSetting): Observable<void> {
    return this.http.put<void>(this.apiUrl, data);
  }
}

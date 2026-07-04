import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { News, CreateNewsDto, UpdateNewsDto } from '../models/news.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private apiUrl = `${environment.apiUrl}/News`;
  private http = inject(HttpClient);

  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });
  }

  getPublishedNews(): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/published`);
  }

  getAllNews(): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/all`, { headers: this.getHeaders() });
  }

  createNews(data: CreateNewsDto): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() });
  }

  updateNews(id: string, data: UpdateNewsDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  deleteNews(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}

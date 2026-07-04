import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Auth`;

  login(credentials: { userName: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // 1. Guardar el Token
        if (response.token) {
          localStorage.setItem('token', response.token);
          
          // 2. EXTRAER EL ROL DESDE EL TOKEN
          // Como el backend no manda 'role' suelto, lo sacamos del token encriptado
          const decoded = this.decodeToken(response.token);
          
          // Buscamos el rol en las propiedades típicas (puede venir como 'role' o con URL larga)
          const roleFromToken = decoded['role'] || 
                                decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                                decoded['Role'];

          if (roleFromToken) {
            localStorage.setItem('role', roleFromToken);
            console.log('Rol extraído del token:', roleFromToken);
          }
        }
      })
    );
  }

  // Método auxiliar para abrir el token (JWT)
  private decodeToken(token: string): any {
    try {
      // Divide el token y decodifica la parte del medio (payload)
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error decodificando token', e);
      return {};
    }
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
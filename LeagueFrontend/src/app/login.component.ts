import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from './services/auth.service'; 
import { AlertService } from './services/alert.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative">
      <a routerLink="/" class="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#388e14] transition-colors group z-10">
        <span class="text-sm font-medium">Volver al inicio</span>
      </a>

      <div class="w-full max-w-[420px] p-10 border border-gray-100 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] bg-white mb-8 relative z-0">
         <div class="text-center mb-8">
           <h1 class="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Iniciar Sesión</h1>
           <p class="text-gray-500 text-sm font-normal">Bienvenido de nuevo a Liga Gremio Laboral.</p>
         </div>

         <form class="space-y-6" (ngSubmit)="onSubmit($event)">
           <div class="space-y-1.5">
             <label for="username" class="block text-sm font-medium text-gray-800">Correo Electrónico</label>
             <input id="username" name="username" type="text" [ngModel]="username()" (ngModelChange)="username.set($event)" placeholder="admin@liga.com" class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9f24]/20 focus:border-[#4a9f24] transition-all text-sm placeholder-gray-400 bg-white text-gray-900">
           </div>

           <div class="space-y-1.5">
             <label for="password" class="block text-sm font-medium text-gray-800">Contraseña</label>
             <div class="relative">
               <input id="password" name="password" [type]="showPassword() ? 'text' : 'password'" [ngModel]="password()" (ngModelChange)="password.set($event)" placeholder="********" class="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9f24]/20 focus:border-[#4a9f24] transition-all text-sm placeholder-gray-400 bg-white text-gray-900">
               <button type="button" (click)="togglePassword()" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#4a9f24] transition-colors focus:outline-none">
                 <!-- Icono de Ojo Abierto -->
                 <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                   <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                 </svg>
                 <!-- Icono de Ojo Cerrado -->
                 <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                 </svg>
               </button>
             </div>
           </div>

           <button type="submit" [disabled]="isLoading()" class="w-full bg-[#388e14] hover:bg-[#2e7510] text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-sm text-sm mt-2 flex justify-center items-center">
             {{ isLoading() ? 'Verificando...' : 'Iniciar Sesión' }}
           </button>
         </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);


  username = signal('');
  password = signal('');
  isLoading = signal(false);
  showPassword = signal(false); // 👈 Señal para la visibilidad

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);

    const credentials = {
      userName: this.username(),
      password: this.password()
    };

    this.authService.login(credentials).subscribe({
      next: (res) => {
        // En este punto el 'tap' del servicio ya extrajo el rol del token
        this.isLoading.set(false);

        const role = this.authService.getRole();
        console.log('Rol final para redirigir:', role); 

        // Normalizamos el rol a string para evitar errores
        const roleStr = String(role);

        // Redirección segura
        if (roleStr === 'Admin') {
          this.router.navigate(['/admin']);
        } else if (roleStr === 'Committee' || roleStr === 'CommitteeMember') {
          this.router.navigate(['/committee']);
        } else if (roleStr === 'Delegate') {
          this.router.navigate(['/delegate']);
        } else {
          // Si no es ninguno, al inicio
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error('Error login:', err);
        this.isLoading.set(false);
        this.alertService.showAlert('Las credenciales ingresadas son incorrectas. Por favor, inténtalo de nuevo.', 'error', 'Error de Acceso');
      }
    });
  }
}
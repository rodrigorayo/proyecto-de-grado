import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      
      <header class="shadow-lg sticky top-0 z-50 transition-all"
              style="background: linear-gradient(to bottom, #388e14 50%, #ffffff 50%);">
        
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">
          
          <a (click)="isMenuOpen.set(false)" routerLink="/" class="flex items-center group">
             <img src="assets/logo-liga.png" 
                  alt="Liga Yacuiba" 
                  class="h-16 w-auto object-contain hover:scale-110 transition-transform drop-shadow-sm">
          </a>

                    <!-- Mobile Menu Button -->
          <button (click)="toggleMenu()" class="md:hidden text-white hover:text-gray-200 focus:outline-none z-50 p-2 bg-[#388e14] rounded-md shadow-md ml-auto mr-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>

          <nav [class.hidden]="!isMenuOpen()" class="absolute md:relative top-full left-0 w-full md:w-auto bg-white/95 md:bg-transparent shadow-lg md:shadow-none md:flex flex-col md:flex-row gap-4 text-sm font-bold text-gray-900 p-6 md:p-0 backdrop-blur-md md:backdrop-blur-none border-b border-gray-200 md:border-none z-40 hidden">
            <a (click)="isMenuOpen.set(false)" routerLink="/" 
               routerLinkActive="ring-2 ring-offset-1 ring-[#388e14] bg-white scale-105" 
               [routerLinkActiveOptions]="{exact: true}" 
               class="px-4 py-2 rounded-full transition-all duration-200 
                      bg-white/90 text-[#388e14] shadow-sm backdrop-blur-sm border border-gray-100
                      hover:bg-white hover:shadow-md hover:-translate-y-0.5
                      active:scale-110 active:shadow-inner">
               Inicio
            </a>
            
            <a (click)="isMenuOpen.set(false)" routerLink="/posiciones" 
               routerLinkActive="ring-2 ring-offset-1 ring-[#388e14] bg-white scale-105" 
               class="px-4 py-2 rounded-full transition-all duration-200 
                      bg-white/90 text-[#388e14] shadow-sm backdrop-blur-sm border border-gray-100
                      hover:bg-white hover:shadow-md hover:-translate-y-0.5
                      active:scale-110 active:shadow-inner">
               Tabla de Posiciones
            </a>
            
            <a (click)="isMenuOpen.set(false)" routerLink="/partidos" 
               routerLinkActive="ring-2 ring-offset-1 ring-[#388e14] bg-white scale-105" 
               class="px-4 py-2 rounded-full transition-all duration-200 
                      bg-white/90 text-[#388e14] shadow-sm backdrop-blur-sm border border-gray-100
                      hover:bg-white hover:shadow-md hover:-translate-y-0.5
                      active:scale-110 active:shadow-inner">
               Partidos y Resultados
            </a>
            
            <a (click)="isMenuOpen.set(false)" routerLink="/noticias" 
               routerLinkActive="ring-2 ring-offset-1 ring-[#388e14] bg-white scale-105" 
               class="px-4 py-2 rounded-full transition-all duration-200 
                      bg-white/90 text-[#388e14] shadow-sm backdrop-blur-sm border border-gray-100
                      hover:bg-white hover:shadow-md hover:-translate-y-0.5
                      active:scale-110 active:shadow-inner">
               Noticias
            </a>

            <a (click)="isMenuOpen.set(false)" routerLink="/sobre-la-liga" 
               routerLinkActive="ring-2 ring-offset-1 ring-[#388e14] bg-white scale-105" 
               class="px-4 py-2 rounded-full transition-all duration-200 
                      bg-white/90 text-[#388e14] shadow-sm backdrop-blur-sm border border-gray-100
                      hover:bg-white hover:shadow-md hover:-translate-y-0.5
                      active:scale-110 active:shadow-inner">
               Sobre la Liga
            </a>
          </nav>

          <a routerLink="/login" 
             class="bg-[#388e14] hover:bg-[#2e7d32] text-white px-6 py-2 rounded-full text-sm font-bold 
                    transition-all duration-200 shadow-md border-2 border-white/20 
                    active:scale-110 active:bg-[#1b5e20]">
            Iniciar Sesión
          </a>
        </div>
      </header>

      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <footer class="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
        <div class="container mx-auto px-4 text-center">
          <p class="text-sm">© 2025 Liga Deportiva Yacuiba - Gran Chaco. Todos los derechos reservados.</p>
          <p class="text-xs mt-2 text-gray-600">Desarrollado con pasión por el fútbol.</p>
        </div>
      </footer>
    </div>
  `
})
export class PublicLayoutComponent { isMenuOpen = signal(false); toggleMenu() { this.isMenuOpen.update(v => !v); } }
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingSettingsService } from '../../services/landing-settings.service';
import { LandingSetting } from '../../models/landing-setting.model';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      <!-- Hero Section -->
      <div class="bg-[#1a1a1a] text-white py-20 relative overflow-hidden">
        <div class="absolute right-0 top-0 opacity-10">
          <svg class="w-96 h-96 -mt-20 -mr-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
        </div>
        
        <div class="container mx-auto px-4 relative z-10 text-center">
          <div class="inline-block bg-[#388e14] text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase mb-6 shadow-lg">
            Institucional
          </div>
          <h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tight">Sobre la Liga</h1>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Conoce nuestra historia, misión y los valores que impulsan el corazón del fútbol gremial.
          </p>
        </div>
      </div>

      <!-- Misión y Visión -->
      <div class="container mx-auto px-4 py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <!-- Misión -->
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
            <div class="w-14 h-14 bg-green-50 text-[#388e14] rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              🎯
            </div>
            <h2 class="text-2xl font-black text-gray-900 mb-4">Nuestra Misión</h2>
            <p class="text-gray-600 leading-relaxed">
              {{ landingSettings()?.aboutMission || 'Cargando misión...' }}
            </p>
          </div>

          <!-- Visión -->
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
            <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              👁️
            </div>
            <h2 class="text-2xl font-black text-gray-900 mb-4">Nuestra Visión</h2>
            <p class="text-gray-600 leading-relaxed">
              {{ landingSettings()?.aboutVision || 'Cargando visión...' }}
            </p>
          </div>

        </div>
      </div>

      <!-- Valores -->
      <div class="bg-white border-t border-gray-200 py-16">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-black text-center text-gray-900 mb-12">Nuestros Valores</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div class="p-6">
              <div class="text-4xl mb-4">🤝</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Compañerismo</h3>
              <p class="text-gray-500 text-sm">Fomentamos la amistad y el respeto entre todos los gremios laborales participantes.</p>
            </div>
            <div class="p-6">
              <div class="text-4xl mb-4">⚖️</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Juego Limpio</h3>
              <p class="text-gray-500 text-sm">Creemos firmemente en el Fair Play, la integridad y el respeto a las reglas del juego.</p>
            </div>
            <div class="p-6">
              <div class="text-4xl mb-4">🚀</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Innovación</h3>
              <p class="text-gray-500 text-sm">Apostamos por la tecnología para transparentar y mejorar la experiencia de nuestros torneos.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contacto -->
      <div class="bg-gray-900 text-white py-16">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl font-black mb-6">¿Quieres afiliar a tu gremio?</h2>
          <p class="text-gray-400 max-w-xl mx-auto mb-8">
            Acércate a nuestras oficinas centrales para conocer los requisitos de inscripción y ser parte de nuestra gran familia deportiva.
          </p>
          <div class="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-xl border border-white/20">
            <span class="text-2xl">📍</span>
            <div class="text-left">
              <p class="text-sm text-gray-400 font-bold uppercase tracking-wider">Dirección</p>
              <p class="font-medium">Secretaría del Campeonato, Yacuiba</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  private landingSettingsService = inject(LandingSettingsService);
  
  landingSettings = signal<LandingSetting | null>(null);

  ngOnInit() {
    this.landingSettingsService.getSettings().subscribe(settings => {
      if (settings && settings.id) {
        this.landingSettings.set(settings);
      }
    });
  }
}

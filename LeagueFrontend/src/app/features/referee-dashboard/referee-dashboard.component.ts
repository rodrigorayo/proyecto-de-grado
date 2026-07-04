import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatchService } from '../../services/match.service';
import { TournamentService } from '../../services/tournament.service';
import { MatchEventService } from '../../services/match-event.service';
import { PlayerService } from '../../services/player.service';
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'app-referee-dashboard',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, ReactiveFormsModule, FormsModule],
  templateUrl: './referee-dashboard.component.html'
})
export class RefereeDashboardComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private matchService = inject(MatchService);
  private tournamentService = inject(TournamentService);
  private matchEventService = inject(MatchEventService);
  private playerService = inject(PlayerService);
  private alertService = inject(AlertService);


  // State
  currentView = signal<string>('dashboard');
  
  // Data
  tournamentsList = signal<any[]>([]);
  selectedTournamentId = signal<string | null>(null);
  matchesList = signal<any[]>([]);
  
  matchSquads = signal<{home: any[], away: any[]}>({ home: [], away: [] });
  matchEvents = signal<any[]>([]); // Para almacenar temporalmente los eventos o mostrarlos

  standingsList = signal<any[]>([]); // Mock por ahora
  newsList = signal<any[]>([]); // Mock por ahora

  // Logic for Reporting
  selectedMatch = signal<any>(null);
  
  reportForm = this.fb.group({
      homeScore: [0, [Validators.required, Validators.min(0)]],
      awayScore: [0, [Validators.required, Validators.min(0)]],
      incidents: ['']
  });

  eventForm = this.fb.group({
      playerId: ['', Validators.required],
      type: [0, Validators.required],
      minute: [1, [Validators.required, Validators.min(1), Validators.max(120)]]
  });

  ngOnInit() {
    this.tournamentService.getAll().subscribe(data => {
      this.tournamentsList.set(data);
      if (data.length > 0) {
        this.selectedTournamentId.set(data[0].id);
        this.loadMatches(data[0].id);
      }
    });

    this.newsList.set([
      { id: 1, title: 'Nuevas Reglas de Arbitraje 2024', date: '01 Nov 2024', excerpt: 'Circular oficial sobre las modificaciones a la regla del fuera de juego y manos en el área.', image: 'https://picsum.photos/id/100/400/250' },
      { id: 2, title: 'Seminario de Capacitación Arbitral', date: '28 Oct 2024', excerpt: 'Este fin de semana se llevará a cabo el seminario anual de actualización para árbitros de primera división.', image: 'https://picsum.photos/id/160/400/250' },
    ]);
  }

  loadMatches(tournamentId: string) {
    this.matchService.getMatchesByTournament(tournamentId).subscribe(data => {
      this.matchesList.set(data);
    });
  }

  onTournamentChange(id: string) {
    this.selectedTournamentId.set(id);
    this.loadMatches(id);
  }

  // Computed Values
  countPending() {
    return this.matchesList().filter(m => m.status === 0).length;
  }
  
  countFinished() {
    return this.matchesList().filter(m => m.status === 2).length;
  }

  // Navigation
  menuItems = signal([
    { id: 'dashboard', label: 'Dashboard', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>' },
    { id: 'partidos', label: 'Mis Partidos', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' },
    { id: 'posiciones', label: 'Posiciones', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>' },
    { id: 'noticias', label: 'Noticias', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9"></path></svg>' },
  ]);

  navigate(event: Event, viewId: string) {
    event.preventDefault();
    this.currentView.set(viewId);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  getPageTitle(): string {
      const map: Record<string, string> = {
          'dashboard': 'Panel Principal',
          'partidos': 'Calendario de Partidos',
          'registrar-acta': 'Registro de Resultados',
          'posiciones': 'Tabla General',
          'noticias': 'Noticias & Circulares'
      };
      return map[this.currentView()] || 'Panel del Árbitro';
  }

  // Methods for Actions
  openReportForm(match: any) {
      this.selectedMatch.set(match);
      this.reportForm.reset({ homeScore: match.homeScore || 0, awayScore: match.awayScore || 0, incidents: match.incidents || '' });
      this.eventForm.reset({ type: 0, minute: 1 });
      this.matchEvents.set([]);
      this.matchSquads.set({ home: [], away: [] });

      // Cargar jugadores
      if (match.homeTeamId) {
          this.playerService.getPlayersByTeam(match.homeTeamId).subscribe(data => {
              this.matchSquads.update(s => ({ ...s, home: data }));
          });
      }
      if (match.awayTeamId) {
          this.playerService.getPlayersByTeam(match.awayTeamId).subscribe(data => {
              this.matchSquads.update(s => ({ ...s, away: data }));
          });
      }

      // Si el partido está finalizado, cargar los eventos reales
      if (match.status === 2) {
          this.matchEventService.getEventsByMatch(match.id).subscribe(data => {
              this.matchEvents.set(data);
          });
      }

      this.currentView.set('registrar-acta');
  }

  addEvent() {
      if (this.eventForm.valid && this.selectedMatch()) {
          const val = this.eventForm.value;
          // Encontramos el jugador para guardarlo temporalmente y mostrarlo en la UI
          const allPlayers = [...this.matchSquads().home, ...this.matchSquads().away];
          const player = allPlayers.find(p => p.id === val.playerId);
          
          const newEvent = {
              tempId: Math.random().toString(), // ID temporal
              playerId: val.playerId,
              type: Number(val.type),
              minute: val.minute,
              player: player
          };
          this.matchEvents.update(e => [...e, newEvent].sort((a,b) => a.minute - b.minute));
          this.eventForm.reset({ type: 0, minute: 1 });
      }
  }

  getEventLabel(type: number): string {
      switch (type) {
          case 0: return '⚽ Gol';
          case 1: return '🟨 Amarilla';
          case 2: return '🟥 Roja';
          case 3: return '❌ Autogol';
          default: return 'Evento';
      }
  }

  async submitReport() {
      if (this.reportForm.valid && this.selectedMatch()) {
          const formVal = this.reportForm.value;
          const matchId = this.selectedMatch().id;
          
          try {
              // 1. Guardar todos los eventos temporales en el backend
              const tempEvents = this.matchEvents().filter(e => e.tempId);
              for (const evt of tempEvents) {
                  await this.matchEventService.addEvent(matchId, evt.playerId, evt.type, evt.minute).toPromise();
              }

              // 2. Guardar el resultado final del acta
              const resultData = {
                  matchId: matchId,
                  homeScore: formVal.homeScore,
                  awayScore: formVal.awayScore,
                  incidents: formVal.incidents
              };
              
              await this.matchService.updateMatchResult(matchId, resultData).toPromise();

              this.alertService.showAlert('Acta oficial de partido registrada correctamente.', 'success', 'Acta Registrada');
              this.selectedMatch.set(null);
              if (this.selectedTournamentId()) {
                  this.loadMatches(this.selectedTournamentId()!);
              }
              this.currentView.set('partidos');
          } catch (error) {
              console.error(error);
              this.alertService.showAlert('Ocurrió un error al guardar el acta. Inténtalo de nuevo.', 'error', 'Error');
          }
      }
  }

  closeMatchReport() {
      this.selectedMatch.set(null);
      this.currentView.set('partidos');
  }
}

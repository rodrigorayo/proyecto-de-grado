import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatchService } from '../../services/match.service';
import { TournamentService } from '../../services/tournament.service';
import { PlayerService } from '../../services/player.service';     // 👈 NUEVO
import { MatchEventService } from '../../services/match-event.service'; // 👈 NUEVO
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'app-committee-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './committee-dashboard.component.html',
  //styleUrls: ['./committee-dashboard.component.css']
})
export class CommitteeDashboardComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private matchService = inject(MatchService);
  private tournamentService = inject(TournamentService);
  private playerService = inject(PlayerService);         // 👈 Inyectar
  private matchEventService = inject(MatchEventService); // 👈 Inyectar
  private alertService = inject(AlertService);


  // --- ESTADO ---
  tournaments = signal<any[]>([]);
  selectedTournamentId = signal<string>('');
  
  currentView = signal<string>('partidos');
  matchesList = signal<any[]>([]);
  isLoading = signal(false);

  // --- ESTADO PARA ACTA (JUGADORES Y EVENTOS) ---
  homePlayers = signal<any[]>([]); // 👈 Lista jugadores Local
  awayPlayers = signal<any[]>([]); // 👈 Lista jugadores Visita
  matchEvents = signal<any[]>([]); // 👈 Lista de goles/tarjetas cargados

  // Formulario Resultado Global
  selectedMatch = signal<any>(null);
  reportForm = this.fb.group({
      homeScore: [0, [Validators.required, Validators.min(0)]],
      awayScore: [0, [Validators.required, Validators.min(0)]],
      incidents: ['']
  });

  // Formulario para AGREGAR UN EVENTO (Gol/Tarjeta)
  eventForm = this.fb.group({
    playerId: ['', Validators.required],
    type: ['0', Validators.required], // 0=Gol, 1=Amarilla, 2=Roja
    minute: [0, [Validators.required, Validators.min(0), Validators.max(130)]]
  });

  // Menú
  menuItems = signal([
    { id: 'dashboard', label: 'Dashboard', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>' },
    { id: 'partidos', label: 'Gestión de Resultados', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' },
  ]);

  ngOnInit() {
    this.loadTournaments();
  }

  // --- CARGA DE DATOS ---
  loadTournaments() {
    this.tournamentService.getAll().subscribe({
      next: (data) => {
        this.tournaments.set(data);
        if (data.length > 0) {
          this.selectedTournamentId.set(data[0].id);
          this.loadMatches();
        }
      },
      error: (err) => console.error(err)
    });
  }

  onTournamentChange(event: any) {
    this.selectedTournamentId.set(event.target.value);
    this.loadMatches();
  }

  loadMatches() {
    const tId = this.selectedTournamentId();
    if (!tId) return;
    this.isLoading.set(true);
    this.matchService.getMatchesByTournament(tId).subscribe({
      next: (data) => {
        // Mapeo seguro
        const formatted = data.map(m => ({
          id: m.id,
          date: new Date(m.matchDate).toLocaleDateString(),
          time: new Date(m.matchDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          home: m.homeTeamName || 'Local',
          away: m.awayTeamName || 'Visita',
          homeTeamId: m.homeTeamId, // Importante para buscar jugadores
          awayTeamId: m.awayTeamId, // Importante para buscar jugadores
          location: m.venue,
          status: m.status,
          statusLabel: this.getStatusLabel(m.status)
        }));
        this.matchesList.set(formatted);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); this.matchesList.set([]); }
    });
  }

  // --- GESTIÓN DEL ACTA (ABRIR FORMULARIO) ---
  openReportForm(match: any) {
    this.selectedMatch.set(match);
    
    // Si ya tiene resultado, lo cargamos
    this.reportForm.patchValue({
      homeScore: match.homeScore || 0,
      awayScore: match.awayScore || 0,
      incidents: '' // Idealmente traeríamos incidencias del backend si existieran
    });
    
    this.eventForm.reset({ type: '0', minute: 0, playerId: '' });

    // 1. Cargar Jugadores de ambos equipos para los dropdowns
    this.loadTeamPlayers(match.homeTeamId, true);
    this.loadTeamPlayers(match.awayTeamId, false);

    // 2. Cargar eventos previos si existen
    this.loadMatchEvents(match.id);

    this.currentView.set('registrar-acta');
  }

  loadTeamPlayers(teamId: string, isHome: boolean) {
    this.playerService.getPlayersByTeam(teamId).subscribe(players => {
      if (isHome) this.homePlayers.set(players);
      else this.awayPlayers.set(players);
    });
  }

  loadMatchEvents(matchId: string) {
    this.matchEventService.getEventsByMatch(matchId).subscribe(events => {
      this.matchEvents.set(events);
    });
  }

  // --- AGREGAR GOL / TARJETA ---
  addEvent() {
    if (this.eventForm.valid && this.selectedMatch()) {
      const { playerId, type, minute } = this.eventForm.value;
      const matchId = this.selectedMatch().id;

      // Llamada al Backend
      this.matchEventService.addEvent(matchId, playerId!, Number(type), minute!).subscribe({
        next: () => {
          // Recargar la lista de eventos
          this.loadMatchEvents(matchId);
          // Reset parcial
          this.eventForm.patchValue({ minute: minute, type: '0', playerId: '' }); 
        },
        error: (e) => this.alertService.showAlert('Error al agregar evento: ' + (e.error?.error || e.message), 'error', 'Error')
      });
    }
  }

  // --- CERRAR ACTA (RESULTADO FINAL) ---
  submitReport() {
      if (this.reportForm.valid && this.selectedMatch()) {
          const formVal = this.reportForm.value;
          const matchId = this.selectedMatch().id;

          const command = {
            matchId: matchId,
            homeScore: Number(formVal.homeScore),
            awayScore: Number(formVal.awayScore),
            incidents: formVal.incidents || ''
          };

          this.matchService.updateMatchResult(matchId, command).subscribe({
            next: () => {
              this.alertService.showAlert('Acta cerrada y resultado final registrado exitosamente.', 'success', 'Éxito');
              this.loadMatches();
              this.selectedMatch.set(null);
              this.currentView.set('partidos');
            },
            error: (err) => this.alertService.showAlert(`Error al guardar el acta: ${err.error?.error || 'No se pudo guardar'}`, 'error', 'Error')
          });
      }
  }

  // Utils
  getStatusLabel(status: number): string {
    return ['Pendiente', 'Jugando', 'Finalizado', 'Cancelado'][status] || 'Desconocido';
  }
  
  // Mapeo visual para la tabla de eventos
  getEventLabel(type: number): string {
    return ['⚽ Gol', '🟨 Amarilla', '🟥 Roja', 'Autogol'][type] || 'Evento';
  }

  countPending() { return this.matchesList().filter(m => m.status === 0).length; }
  countFinished() { return this.matchesList().filter(m => m.status === 2).length; }

  navigate(event: Event, viewId: string) {
    event.preventDefault();
    this.currentView.set(viewId);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getPageTitle() { return 'Panel del Comité'; }
}
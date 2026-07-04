import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { PlayerService } from '../../services/player.service';
import { TournamentService } from '../../services/tournament.service';
import { MatchService } from '../../services/match.service';
import { MatchEventService } from '../../services/match-event.service';
import { ImageService } from '../../services/image.service';
import { PredictionService } from '../../services/prediction.service'; // 👈 INYECTAR
import { AlertService } from '../../services/alert.service';
import { AdminNewsComponent } from '../admin-news/admin-news.component';
import { AdminLandingComponent } from '../admin-landing/admin-landing.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminNewsComponent, AdminLandingComponent],
  templateUrl: './admin-dashboard.component.html',
  //styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  // Servicios
  private teamService = inject(TeamService);
  private playerService = inject(PlayerService);
  private tournamentService = inject(TournamentService);
  private matchService = inject(MatchService); // Se mantiene private
  private matchEventService = inject(MatchEventService);
  private imageService = inject(ImageService);
  private predictionService = inject(PredictionService); // 👈 INYECTAR
  private alertService = inject(AlertService);

  
  // Estado de Vista
  currentView = signal<string>('dashboard');
  
  // Listas de Datos
  teamsList = signal<any[]>([]);
  playersList = signal<any[]>([]);
  tournamentsList = signal<any[]>([]);
  matchesList = signal<any[]>([]);
  
  // Datos para "Gestionar Partido"
  selectedMatch = signal<any>(null);
  matchSquads = signal<{ home: any[], away: any[] }>({ home: [], away: [] });
  matchEvents = signal<any[]>([]);
  
  // Contadores y Estados
  globalPlayerCount = signal<number>(0);
  editingTeamId = signal<string | null>(null);
  selectedTeamId = signal<string | null>(null);
  editingPlayerId = signal<string | null>(null);
  editingTournamentId = signal<string | null>(null);
  showNewTournamentForm = signal<boolean>(false);
  selectedTournamentIdMatchView = signal<string | null>(null);

  // --- IMÁGENES ---
  tempTeamLogoUrl = signal<string>('');
  tempPlayerPhotoUrl = signal<string>('');
  isUploading = signal(false);

  // --- IA STATE (CRÓNICAS) ---
  isGeneratingAI = signal(false);
  isEditingChronicle = signal<boolean>(false);
  editedChronicleText = signal<string>('');
  isSavingChronicle = signal<boolean>(false);

  // --- IA STATE (PREDICCIONES) 👇👇 ---
  aiAnalysis = signal<any>(null); // Aquí guardamos el JSON que devuelve Gemini
  isAnalyzingMatch = signal(false); // Para el spinner de carga


  // --- VALIDACIONES ---
  teamsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => { 
    const home = control.get('homeTeamId'); 
    const away = control.get('awayTeamId');
    return home && away && home.value === away.value ? { sameTeam: true } : null; 
  };

  // --- FORMULARIOS ---
  teamForm = this.fb.group({ 
    name: ['', Validators.required], 
    category: ['Primera A', Validators.required] 
  });

  playerForm = this.fb.group({ 
    teamId: ['', Validators.required], 
    fullName: ['', Validators.required], 
    identityCard: ['', Validators.required], 
    jerseyNumber: ['', Validators.required], 
    position: ['Midfielder', Validators.required], 
    birthDate: [''] 
  });

  tournamentForm = this.fb.group({ 
    name: ['', Validators.required], 
    startDate: ['', Validators.required], 
    endDate: [''] 
  });

  matchForm = this.fb.group({ 
    homeTeamId: ['', Validators.required], 
    awayTeamId: ['', Validators.required], 
    matchDate: ['', Validators.required], 
    venue: ['Estadio Principal', Validators.required] 
  }, { validators: this.teamsMatchValidator });

  eventForm = this.fb.group({
    playerId: ['', Validators.required],
    type: ['0', Validators.required],
    minute: [0, [Validators.required, Validators.min(0)]]
  });

  resultForm = this.fb.group({
    homeScore: [0, [Validators.required, Validators.min(0)]],
    awayScore: [0, [Validators.required, Validators.min(0)]],
    incidents: ['']
  });

  // --- MENÚ LATERAL ---
  menuItems = signal([
    { id: 'dashboard', label: 'Dashboard', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>' },
    { id: 'equipos', label: 'Equipos', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>' },
    { id: 'jugadores', label: 'Jugadores', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>' },
    { id: 'partidos', label: 'Partidos', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' },
    { id: 'noticias', label: 'Noticias', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-.586-1.414l-4.5-4.5A2 2 0 0015.5 3H15m3 16H8m11-4H8m11-4H8" /></svg>' },
    { id: 'diseno', label: 'Diseño Web', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' },
    { id: 'configuracion', label: 'Torneos', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' }
  ]);

  ngOnInit() {
    this.loadRealTeams();
    this.loadTournaments();
  }

  navigate(event: Event, viewId: string) { 
    event.preventDefault(); 
    this.currentView.set(viewId);
  }
  
  logout() { this.router.navigate(['/login']); }

  // --- CARGA DE DATOS ---
  loadRealTeams() { 
    this.teamService.getTeams().subscribe({
      next: (d) => { 
        this.teamsList.set(d); 
        this.globalPlayerCount.set(d.reduce((a:any,b:any)=>a+(b.players?.length||0),0)); 
      },
      error: (e) => {
        console.error('Error cargando equipos:', e);
      }
    }); 
  }
  loadTournaments() { this.tournamentService.getAll().subscribe(d => this.tournamentsList.set(d)); }

  // --- IMÁGENES ---
  onFileSelected(event: any, type: 'team' | 'player') {
    const file: File = event.target.files[0];
    if (file) {
      this.isUploading.set(true);
      this.imageService.upload(file).subscribe({
        next: (res) => {
          this.isUploading.set(false);
          if (type === 'team') this.tempTeamLogoUrl.set(res.url);
          else this.tempPlayerPhotoUrl.set(res.url);
        },
        error: (e) => {
          this.isUploading.set(false);
          this.alertService.showAlert('Error al subir la imagen: ' + e.message, 'error', 'Error de Carga');
        }
      });
    }
  }

  // --- EQUIPOS ---
  startCreatingTeam() { 
    this.editingTeamId.set(null); 
    this.teamForm.reset({category: 'Primera A'}); 
    this.tempTeamLogoUrl.set('');
    this.currentView.set('registrar-equipo'); 
  }

  startEditingTeam(t: any) { 
    this.editingTeamId.set(t.id); 
    this.teamForm.patchValue(t); 
    this.tempTeamLogoUrl.set(t.logoUrl || '');
    this.currentView.set('registrar-equipo'); 
  }

  deleteTeam(t: any) {
    const action = t.isActive ? 'desactivar' : 'activar';
    this.alertService.showConfirm(`¿Estás seguro de que deseas ${action} el equipo "${t.name}"?`, `Confirmar ${action.charAt(0).toUpperCase() + action.slice(1)}`).then(confirmed => {
      if (confirmed) {
        this.teamService.deleteTeam(t.id).subscribe(() => this.loadRealTeams());
      }
    });
  }
  
  onSubmitTeam() { 
    if(this.teamForm.valid) { 
        const d = { ...this.teamForm.value, id: this.editingTeamId(), logoUrl: this.tempTeamLogoUrl() }; 
        const req = this.editingTeamId() ? this.teamService.updateTeam(this.editingTeamId()!,d) : this.teamService.createTeam(d);
        req.subscribe(()=>this.finalizeTeamAction()); 
    } 
  }
  finalizeTeamAction() { this.loadRealTeams(); this.currentView.set('equipos'); this.editingTeamId.set(null); this.tempTeamLogoUrl.set(''); }

  // --- JUGADORES ---
  onTeamFilterChange(id: string) { this.selectedTeamId.set(id); this.loadPlayers(id); }
  loadPlayers(id: string) { this.playerService.getPlayersByTeam(id).subscribe(d => this.playersList.set(d.map((p:any)=>({...p, positionLabel:['ARQ','DEF','MED','DEL'][p.position]})))); }
  
  startCreatingPlayer() { 
    this.editingPlayerId.set(null); 
    this.playerForm.reset({ teamId: this.selectedTeamId()||'' }); 
    this.tempPlayerPhotoUrl.set('');
    this.currentView.set('registrar-jugador'); 
  }
  
  startEditingPlayer(p: any) { 
    this.editingPlayerId.set(p.id); 
    this.playerForm.patchValue({...p, birthDate: p.birthDate?.split('T')[0]}); 
    this.tempPlayerPhotoUrl.set(p.photoUrl || '');
    this.currentView.set('registrar-jugador'); 
  }

  deletePlayer(p: any) {
    const action = p.isActive ? 'desactivar' : 'activar';
    this.alertService.showConfirm(`¿Estás seguro de que deseas ${action} al jugador "${p.fullName}"?`, `Confirmar ${action.charAt(0).toUpperCase() + action.slice(1)}`).then(confirmed => {
      if (confirmed) {
        this.playerService.deletePlayer(p.id).subscribe(() => {
          this.loadPlayers(this.selectedTeamId()!);
          this.loadRealTeams();
        });
      }
    });
  }
  
  onSubmitPlayer() { 
    if(this.playerForm.valid) { 
        const d = { 
            id: this.editingPlayerId(), 
            ...this.playerForm.value, 
            ci: this.playerForm.value.identityCard, 
            number: this.playerForm.value.jerseyNumber,
            photoUrl: this.tempPlayerPhotoUrl()
        }; 
        const req = this.editingPlayerId() ? this.playerService.updatePlayer(this.editingPlayerId()!,d) : this.playerService.createPlayer(d);
        req.subscribe(()=>this.finalizePlayerAction()); 
    } 
  }
  finalizePlayerAction() { 
    if(this.playerForm.value.teamId) { this.selectedTeamId.set(this.playerForm.value.teamId!); this.loadPlayers(this.playerForm.value.teamId!); } 
    this.loadRealTeams(); 
    this.currentView.set('jugadores'); 
    this.editingPlayerId.set(null); 
    this.tempPlayerPhotoUrl.set('');
  }

  // --- TORNEOS ---
  isFuture(d: string) { return new Date(d) > new Date(); }
  startCreatingTournament() { this.editingTournamentId.set(null); this.tournamentForm.reset(); this.showNewTournamentForm.set(true); }
  startEditingTournament(t: any) { this.editingTournamentId.set(t.id); this.tournamentForm.patchValue({name:t.name, startDate:t.startDate.split('T')[0], endDate:t.endDate?.split('T')[0]}); this.showNewTournamentForm.set(false); }
  cancelTournamentEdit() { this.editingTournamentId.set(null); this.showNewTournamentForm.set(false); }
  deleteTournament(t: any) {
    const action = t.isActive ? 'desactivar' : 'activar';
    this.alertService.showConfirm(`¿Estás seguro de que deseas ${action} el torneo "${t.name}"?`, `Confirmar ${action.charAt(0).toUpperCase() + action.slice(1)}`).then(confirmed => {
      if (confirmed) {
        this.tournamentService.delete(t.id).subscribe(() => this.loadTournaments());
      }
    });
  }
  onSubmitTournament() { 
    if(this.tournamentForm.valid) { 
        const d={...this.tournamentForm.value, id:this.editingTournamentId()}; 
        if(!d.endDate) d.endDate=null; 
        const req = this.editingTournamentId() ? this.tournamentService.update(this.editingTournamentId()!,d) : this.tournamentService.create(d);
        req.subscribe(()=>{
          this.alertService.showAlert('Torneo guardado correctamente.', 'success', 'Torneo Guardado');
          this.loadTournaments();
          this.cancelTournamentEdit();
        }); 
    } 
  }

  // --- PARTIDOS ---
  onTournamentFilterChange(id: string) { this.selectedTournamentIdMatchView.set(id); this.loadMatches(id); }
  loadMatches(id: string) { this.matchService.getMatchesByTournament(id).subscribe(d => this.matchesList.set(d)); }
  getMatchStatus(s: number) { return ['Programado','En Juego','Finalizado','Cancelado'][s]; }
  getTournamentName(id: string | null) { return id ? this.tournamentsList().find(t => t.id === id)?.name : ''; }
  
  startProgrammingMatch() {
    if(!this.selectedTournamentIdMatchView()) {
      this.alertService.showAlert('Selecciona un torneo arriba primero.', 'warning', 'Atención');
      return;
    }
    const now = new Date();
    const nowString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    this.matchForm.reset({venue:'Estadio Principal', matchDate: nowString, homeTeamId: '', awayTeamId: ''});
    this.currentView.set('programar-partido');
  }

  onSubmitMatch() {
    if(this.matchForm.valid) {
      const matchData = { tournamentId: this.selectedTournamentIdMatchView(), ...this.matchForm.value };
      this.matchService.createMatch(matchData).subscribe({
        next:()=>{
          this.alertService.showAlert('Partido programado exitosamente.', 'success', 'Partido Programado');
          this.loadMatches(this.selectedTournamentIdMatchView()!);
          this.currentView.set('partidos');
        },
        error:(e)=>this.alertService.showAlert('Error al programar partido: ' + (e.error?.error || e.message), 'error', 'Error')
      });
    }
  }

  // --- GESTIÓN DE EVENTOS (MINUTO A MINUTO) ---
  manageMatch(match: any) {
    this.selectedMatch.set(match);
    
    // 👇👇 LIMPIAMOS EL ANÁLISIS DE LA IA AL CAMBIAR DE PARTIDO 👇👇
    this.aiAnalysis.set(null);
    
    // Cargamos incidents y chronicle si existen
    this.resultForm.reset({ 
        homeScore: match.homeScore || 0, 
        awayScore: match.awayScore || 0, 
        incidents: match.incidents || '' 
    });
    this.eventForm.reset({ type: '0', minute: 0, playerId: '' });
    this.playerService.getPlayersByTeam(match.homeTeamId).subscribe(home => {
        this.playerService.getPlayersByTeam(match.awayTeamId).subscribe(away => {
            this.matchSquads.set({ home, away });
        });
    });
    this.loadMatchEvents(match.id);
    this.currentView.set('gestionar-partido');
  }

  loadMatchEvents(matchId: string) {
    this.matchEventService.getEventsByMatch(matchId).subscribe(events => { this.matchEvents.set(events); });
  }

  addEvent() {
    if (this.eventForm.valid && this.selectedMatch()) {
        const { playerId, type, minute } = this.eventForm.value;
        const matchId = this.selectedMatch().id;
        this.matchEventService.addEvent(matchId, playerId!, Number(type), minute!).subscribe({
            next: () => { this.loadMatchEvents(matchId); this.eventForm.patchValue({ minute: minute, type: '0', playerId: '' }); },
            error: (e) => this.alertService.showAlert('Error al agregar evento: ' + e.message, 'error', 'Error')
        });
    }
  }

  // 👇 FUNCIÓN PARA GENERAR CRÓNICA CON IA (POST-PARTIDO) 👇
  generateAIChronicle() {
    const match = this.selectedMatch();
    if (!match) return;

    this.alertService.showConfirm('¿Quieres que la IA escriba la crónica de este partido basada en los goles y eventos?', 'Generar Crónica').then(confirmed => {
      if (!confirmed) return;
      this.isGeneratingAI.set(true);
      this.matchService.generateChronicle(match.id).subscribe({
        next: (res: any) => {
          this.isGeneratingAI.set(false);
          this.selectedMatch.update(m => ({ ...m, chronicle: res.chronicle }));
          this.alertService.showAlert('Crónica generada con éxito.', 'success', 'Éxito');
        },
        error: (err) => {
          this.isGeneratingAI.set(false);
          this.alertService.showAlert('Error al generar crónica: ' + err.message, 'error', 'Error');
        }
      });
    });
  }

  startEditingChronicle() {
    const match = this.selectedMatch();
    if (match) {
      this.editedChronicleText.set(match.chronicle || '');
      this.isEditingChronicle.set(true);
    }
  }

  cancelEditingChronicle() {
    this.isEditingChronicle.set(false);
  }

  saveEditedChronicle() {
    const match = this.selectedMatch();
    if (match && this.editedChronicleText().trim()) {
      this.isSavingChronicle.set(true);
      this.matchService.updateChronicle(match.id, this.editedChronicleText()).subscribe({
        next: () => {
          this.isSavingChronicle.set(false);
          this.isEditingChronicle.set(false);
          this.selectedMatch.update(m => ({ ...m, chronicle: this.editedChronicleText() }));
          this.alertService.showAlert('Crónica guardada correctamente.', 'success', 'Éxito');
        },
        error: (err) => {
          this.isSavingChronicle.set(false);
          this.alertService.showAlert('Error al guardar la crónica: ' + err.message, 'error', 'Error');
        }
      });
    }
  }


  // 👇 FUNCIÓN PARA PREDICCIÓN IA (PRE-PARTIDO) 👇
  runMatchAnalysis() {
    const match = this.selectedMatch();
    if (!match) return;

    this.isAnalyzingMatch.set(true);
    this.aiAnalysis.set(null); // Limpiamos análisis previo

    this.predictionService.analyzeMatch(match.id).subscribe({
      next: (res) => {
        this.isAnalyzingMatch.set(false);
        this.aiAnalysis.set(res);
      },
        error: (err) => {
          this.isAnalyzingMatch.set(false);
          this.alertService.showAlert('Error al analizar el partido: ' + (err.error?.error || err.message), 'error', 'Error');
        }
    });
  }

  closeMatchReport() {
      if (this.resultForm.valid && this.selectedMatch()) {
          const formVal = this.resultForm.value;
          const matchId = this.selectedMatch().id;
          const command = { 
              matchId: matchId, 
              homeScore: Number(formVal.homeScore), 
              awayScore: Number(formVal.awayScore), 
              incidents: formVal.incidents || '' 
          };
          this.matchService.updateMatchResult(matchId, command).subscribe({
            next: () => {
              this.alertService.showAlert('Partido finalizado y resultado oficial registrado.', 'success', 'Partido Finalizado');
              this.loadMatches(this.selectedTournamentIdMatchView()!);
              this.selectedMatch.set(null);
              this.currentView.set('partidos');
            },
            error: (err) => this.alertService.showAlert(`Error al registrar el resultado: ${err.error?.error || 'No se pudo guardar'}`, 'error', 'Error')
          });
      }
  }

  getEventLabel(type: number): string { return ['⚽ Gol', '🟨 Amarilla', '🟥 Roja', 'Autogol'][type] || 'Evento'; }
}
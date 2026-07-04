import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TournamentService } from '../services/tournament.service';
import { MatchService } from '../services/match.service';
import { MatchEventService } from '../services/match-event.service';

@Component({
  selector: 'app-public-matches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-12">
      
      <div class="grid lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2">
            <h2 class="text-3xl font-black text-gray-900 mb-2">Partidos y Resultados</h2>
            <p class="text-gray-500 mb-6">Calendario oficial de encuentros.</p>

            <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
                <label class="font-bold text-gray-700">Torneo:</label>
                <select [ngModel]="selectedTournamentId()" (ngModelChange)="onTournamentChange($event)" class="border rounded-lg px-4 py-2 flex-1 bg-white cursor-pointer">
                    <option [ngValue]="null" disabled selected>-- Selecciona un Torneo --</option>
                    @for (t of tournaments(); track t.id) { <option [value]="t.id">{{ t.name }}</option> }
                </select>
            </div>

            @if (selectedTournamentId()) {
                <div class="space-y-4">
                    @for (match of matches(); track match.id) {
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden">
                            
                            @if (match.chronicle) {
                                <div class="absolute top-0 right-0 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                    📰 Crónica
                                </div>
                            }

                            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div class="text-center md:text-left min-w-[100px]">
                                    <span class="block text-sm font-bold text-gray-400 uppercase tracking-wider">{{ match.matchDate | date:'MMM d' }}</span>
                                    <span class="block text-xl font-black text-gray-800">{{ match.matchDate | date:'HH:mm' }}</span>
                                </div>

                                <div class="flex-1 flex items-center justify-center gap-4 w-full">
                                    <span class="text-lg md:text-xl font-bold text-gray-900 text-right flex-1">{{ match.homeTeam?.name }}</span>
                                    
                                    @if (match.status === 2) {
                                        <div class="bg-[#388e14] text-white px-4 py-2 rounded-lg font-black text-2xl shadow-lg min-w-[100px] text-center">
                                            {{ match.homeScore }} - {{ match.awayScore }}
                                        </div>
                                    } @else {
                                        <div class="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-bold text-xl min-w-[80px] text-center">
                                            VS
                                        </div>
                                    }

                                    <span class="text-lg md:text-xl font-bold text-gray-900 text-left flex-1">{{ match.awayTeam?.name }}</span>
                                </div>

                                <div class="min-w-[100px] text-center md:text-right flex flex-col items-center md:items-end gap-2">
                                    <span class="px-3 py-1 rounded-full text-xs font-bold uppercase" 
                                        [ngClass]="match.status === 2 ? 'bg-green-100 text-green-800' : (match.status === 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600')">
                                        {{ match.status === 2 ? 'Finalizado' : 'Programado' }}
                                    </span>
                                    
                                    @if (match.chronicle) {
                                        <button (click)="openChronicle(match)" class="text-xs flex items-center gap-1 text-purple-600 font-bold hover:text-purple-800 hover:underline transition-all">
                                            <span>📰</span> Leer Crónica
                                        </button>
                                    }
                                    
                                    <p class="text-xs text-gray-400 mt-1">{{ match.venue }}</p>
                                </div>
                            </div>
                        </div>
                    } @empty { <div class="p-12 text-center text-gray-400 bg-white border border-dashed rounded-lg">No hay partidos programados.</div> }
                </div>
            } @else {
                <div class="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <p class="text-gray-500 text-lg">☝️ Selecciona un torneo para ver el fixture.</p>
                </div>
            }
        </div>

        <div class="lg:col-span-1">
            <h2 class="text-2xl font-black text-gray-900 mb-2">Goleadores</h2>
            <p class="text-gray-500 mb-6">Top artilleros de la liga.</p>

            <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div class="bg-[#388e14] h-2 w-full"></div>
                <div class="divide-y divide-gray-100">
                    @for (scorer of topScorers(); track scorer.playerName; let i = $index) {
                        <div class="p-4 flex items-center gap-4 hover:bg-gray-50">
                            <span class="text-2xl font-black text-gray-300 w-8 text-center">{{ i + 1 }}</span>
                            <div class="flex-1">
                                <p class="font-bold text-gray-900">{{ scorer.playerName }}</p>
                                <p class="text-xs text-gray-500 uppercase font-bold">{{ scorer.teamName }}</p>
                            </div>
                            <div class="bg-green-50 text-[#388e14] w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border border-green-100">
                                {{ scorer.goals }}
                            </div>
                        </div>
                    } @empty { <div class="p-8 text-center text-gray-400">Aún no hay goles registrados.</div> }
                </div>
            </div>
        </div>

      </div>
    </div>

    @if (selectedMatchForChronicle()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" (click)="closeChronicle()">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100" (click)="$event.stopPropagation()">
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative">
                    <button (click)="closeChronicle()" class="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <div class="flex items-center gap-2 mb-2 opacity-90">
                        <span class="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">Resumen del Partido</span>
                        <span class="text-xs font-medium">{{ selectedMatchForChronicle().matchDate | date:'mediumDate' }}</span>
                    </div>
                    <h3 class="text-2xl font-black leading-tight">
                        {{ selectedMatchForChronicle().homeTeam?.name }} <span class="opacity-50">vs</span> {{ selectedMatchForChronicle().awayTeam?.name }}
                    </h3>
                </div>

                <div class="p-8 max-h-[70vh] overflow-y-auto">
                    <div class="prose prose-purple max-w-none text-gray-700 leading-relaxed whitespace-pre-line font-medium text-lg">
                        {{ selectedMatchForChronicle().chronicle }}
                    </div>
                    
                    <div class="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end text-sm text-gray-400">
                        <span>Liga Gremial Yacuiba</span>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <button (click)="closeChronicle()" class="text-gray-600 font-bold hover:text-gray-900 hover:bg-gray-200 px-6 py-2 rounded-lg transition-colors">Cerrar Noticia</button>
                </div>
            </div>
        </div>
    }
  `
})
export class PublicMatchesComponent implements OnInit {
  private tournamentService = inject(TournamentService);
  private matchService = inject(MatchService);
  private matchEventService = inject(MatchEventService);

  tournaments = signal<any[]>([]);
  selectedTournamentId = signal<string | null>(null);
  matches = signal<any[]>([]);
  topScorers = signal<any[]>([]);

  // Señal para controlar qué crónica se está leyendo
  selectedMatchForChronicle = signal<any>(null);

  ngOnInit() {
    this.tournamentService.getAll().subscribe(data => this.tournaments.set(data));
    this.loadTopScorers();
  }

  onTournamentChange(id: string) {
    this.selectedTournamentId.set(id);
    this.matchService.getMatchesByTournament(id).subscribe(data => this.matches.set(data));
  }

  loadTopScorers() {
    this.matchEventService.getTopScorers().subscribe(data => this.topScorers.set(data));
  }

  // Métodos para el Modal
  openChronicle(match: any) {
    this.selectedMatchForChronicle.set(match);
  }

  closeChronicle() {
    this.selectedMatchForChronicle.set(null);
  }
}
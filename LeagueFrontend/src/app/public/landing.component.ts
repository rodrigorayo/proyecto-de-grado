import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TournamentService } from '../services/tournament.service';
import { StandingService } from '../services/standing.service';
import { MatchEventService } from '../services/match-event.service';
import { MatchService } from '../services/match.service';
import { LandingSettingsService } from '../services/landing-settings.service';
import { LandingSetting } from '../models/landing-setting.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html'
})
export class LandingComponent implements OnInit {
  private tournamentService = inject(TournamentService);
  private standingService = inject(StandingService);
  private matchEventService = inject(MatchEventService);
  private matchService = inject(MatchService); 
  private landingSettingsService = inject(LandingSettingsService);

  currentTournament = signal<any>(null);
  leader = signal<any>(null);
  top3Teams = signal<any[]>([]); 
  topScorer = signal<any>(null);
  topScorersList = signal<any[]>([]);
  recentMatches = signal<any[]>([]); 
  
  landingSettings = signal<LandingSetting | null>(null);
  showPopUp = signal<boolean>(false);

  ngOnInit() {
    this.loadSettings();
    this.loadData();
  }

  loadSettings() {
    this.landingSettingsService.getSettings().subscribe(settings => {
      if (settings && settings.id) {
        this.landingSettings.set(settings);
        if (settings.popUpEnabled) {
          this.showPopUp.set(true);
        }
      } else {
        // Fallback default
        this.landingSettings.set({
          heroTitle: 'EL CORAZÓN DEL FÚTBOL GREMIAL',
          heroSubtitle: 'Temporada 2025',
          heroDescription: 'Resultados en vivo, estadísticas detalladas y crónicas impulsadas por inteligencia artificial.',
          popUpEnabled: false,
          popUpTitle: '',
          popUpContent: '',
          popUpImageUrl: '',
          popUpLinkUrl: '',
          aboutMission: '',
          aboutVision: ''
        });
      }
    });
  }

  closePopUp() {
    this.showPopUp.set(false);
  }

  loadData() {
    this.tournamentService.getAll().subscribe(tournaments => {
      if (tournaments.length > 0) {
        const lastTournament = tournaments[0]; 
        this.currentTournament.set(lastTournament);

        this.standingService.getStandings(lastTournament.id).subscribe(standings => {
          if (standings.length > 0) {
            this.leader.set(standings[0]);
            this.top3Teams.set(standings.slice(0, 3));
          }
        });

        this.matchService.getMatchesByTournament(lastTournament.id).subscribe(matches => {
            const recent = matches
                .filter(m => m.status !== 0) 
                .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
                .slice(0, 10);
            this.recentMatches.set(recent);
        });
      }
    });

    this.matchEventService.getTopScorers().subscribe(scorers => {
      this.topScorersList.set(scorers);
      if (scorers.length > 0) {
        this.topScorer.set(scorers[0]);
      }
    });
  }
}
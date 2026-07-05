
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

interface TeamStats {
  pos: number;
  team: string;
  pj: number;
  pts: number;
}

interface Match {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  location: string;
}

interface Result {
  homeTeam: string;
  awayTeam: string;
  score: string;
  date: string;
  status: string;
}

interface NewsItem {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  imageUrl: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
})
export class HomeComponent {
  
  // Data for the Standings Table
  standings = signal<TeamStats[]>([
    { pos: 1, team: 'Los Tigres', pj: 10, pts: 28 },
    { pos: 2, team: 'Halcones Azules', pj: 10, pts: 25 },
    { pos: 3, team: 'Pumas FC', pj: 10, pts: 22 },
    { pos: 4, team: 'Guerreros Blancos', pj: 10, pts: 20 },
    { pos: 5, team: 'Estrellas Rojas', pj: 10, pts: 18 },
  ]);

  // Data for Recent Results
  recentResults = signal<Result[]>([
    { homeTeam: 'Los Tigres', awayTeam: 'Pumas FC', score: '2 - 1', date: '18 Mayo 2024', status: 'Finalizado' },
    { homeTeam: 'Halcones Azules', awayTeam: 'Guerreros', score: '1 - 1', date: '17 Mayo 2024', status: 'Finalizado' },
    { homeTeam: 'Estrellas Rojas', awayTeam: 'Dep. Unión', score: '0 - 2', date: '16 Mayo 2024', status: 'Finalizado' },
  ]);

  // Data for Upcoming Matches
  upcomingMatches = signal<Match[]>([
    {
      homeTeam: 'Los Tigres',
      awayTeam: 'Halcones Azules',
      date: '25 Mayo 2024',
      time: '18:00 PM',
      location: 'Estadio Central'
    },
    {
      homeTeam: 'Pumas FC',
      awayTeam: 'Guerreros Blancos',
      date: '26 Mayo 2024',
      time: '16:00 PM',
      location: 'Cancha Principal'
    },
    {
      homeTeam: 'Estrellas Rojas',
      awayTeam: 'Deportiva Unión',
      date: '26 Mayo 2024',
      time: '18:30 PM',
      location: 'Campo Secundario'
    }
  ]);

  // Data for News
  newsItems = signal<NewsItem[]>([
    {
      id: 1,
      title: 'Los Tigres Asaltan la Cima de la Tabla',
      date: '20 Mayo 2024',
      excerpt: 'Con una victoria contundente, Los Tigres se afianzan en la primera posición, mostrando un rendimiento impecable en las últimas jornadas.',
      imageUrl: 'https://picsum.photos/id/1058/800/600'
    },
    {
      id: 2,
      title: 'Halcones Azules Sorprenden con su Estrategia',
      date: '19 Mayo 2024',
      excerpt: 'El equipo de los Halcones Azules ha demostrado ser una fuerza formidable esta temporada, implementando tácticas innovadoras.',
      imageUrl: 'https://picsum.photos/id/160/800/600'
    },
    {
      id: 3,
      title: 'Jóvenes Talentos Brillan en la Liga',
      date: '18 Mayo 2024',
      excerpt: 'Esta temporada ha sido testigo del surgimiento de varias estrellas jóvenes que están dejando su huella en cada partido.',
      imageUrl: 'https://picsum.photos/id/103/800/600'
    }
  ]);

  // Menu Items with IDs for scrolling
  menuItems = signal([
    { label: 'Tabla de posiciones', id: 'posiciones' },
    { label: 'Resultados', id: 'resultados' },
    { label: 'Próximos partidos', id: 'proximos-partidos' },
    { label: 'Noticias', id: 'noticias' }
  ]);

  scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

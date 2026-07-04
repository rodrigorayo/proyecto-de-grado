import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../services/news.service';
import { News } from '../../models/news.model';

@Component({
  selector: 'app-news-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-public.component.html',
  styleUrls: ['./news-public.component.css']
})
export class NewsPublicComponent implements OnInit {
  private newsService = inject(NewsService);
  newsList: News[] = [];
  isLoading = true;

  ngOnInit() {
    this.newsService.getPublishedNews().subscribe({
      next: (data) => {
        this.newsList = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading news', err);
        this.isLoading = false;
      }
    });
  }
}

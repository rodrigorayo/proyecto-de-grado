import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NewsService } from '../../services/news.service';
import { ImageService } from '../../services/image.service';
import { News } from '../../models/news.model';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-news.component.html',
  styleUrls: ['./admin-news.component.css']
})
export class AdminNewsComponent implements OnInit {
  private newsService = inject(NewsService);
  private imageService = inject(ImageService);

  newsList: News[] = [];
  
  showModal = false;
  isEditing = false;
  currentNewsId: string | null = null;
  
  formData = {
    title: '',
    summary: '',
    body: '',
    imageUrl: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.newsService.getAllNews().subscribe({
      next: (data) => this.newsList = data,
      error: (err) => console.error('Error loading news', err)
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentNewsId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(news: News) {
    this.isEditing = true;
    this.currentNewsId = news.id;
    this.formData = {
      title: news.title,
      summary: news.summary || '',
      body: news.body,
      imageUrl: news.imageUrl || ''
    };
    this.imagePreview = news.imageUrl || null;
    this.selectedFile = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.formData = { title: '', summary: '', body: '', imageUrl: '' };
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  async saveNews() {
    try {
      if (this.selectedFile) {
        this.isUploading = true;
        // La suscripción debe esperar la respuesta para poder seguir
        const res = await firstValueFrom(this.imageService.upload(this.selectedFile));
        this.formData.imageUrl = res.url;
        this.isUploading = false;
      }

      if (this.isEditing && this.currentNewsId) {
        this.newsService.updateNews(this.currentNewsId, this.formData).subscribe({
          next: () => {
            this.loadNews();
            this.closeModal();
          }
        });
      } else {
        this.newsService.createNews(this.formData).subscribe({
          next: () => {
            this.loadNews();
            this.closeModal();
          }
        });
      }
    } catch (error) {
      console.error('Error saving news', error);
      this.isUploading = false;
    }
  }

  deleteNews(id: string) {
    if (confirm('¿Seguro que deseas eliminar esta noticia?')) {
      this.newsService.deleteNews(id).subscribe({
        next: () => this.loadNews()
      });
    }
  }
}

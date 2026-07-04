import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LandingSettingsService } from '../../services/landing-settings.service';
import { ImageService } from '../../services/image.service';
import { AlertService } from '../../services/alert.service';
import { firstValueFrom } from 'rxjs';
import { LandingSetting } from '../../models/landing-setting.model';

@Component({
  selector: 'app-admin-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-landing.component.html',
  styleUrls: ['./admin-landing.component.css']
})
export class AdminLandingComponent implements OnInit {
  private landingService = inject(LandingSettingsService);
  private imageService = inject(ImageService);
  private alertService = inject(AlertService);

  formData: LandingSetting = {
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    popUpEnabled: false,
    popUpTitle: '',
    popUpContent: '',
    popUpImageUrl: '',
    popUpLinkUrl: '',
    aboutMission: '',
    aboutVision: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;
  isLoading = true;

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading = true;
    this.landingService.getSettings().subscribe({
      next: (data) => {
        if (data && data.id) {
            this.formData = data;
            this.imagePreview = data.popUpImageUrl || null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading settings', err);
        this.isLoading = false;
      }
    });
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

  async saveSettings() {
    try {
      if (this.selectedFile) {
        this.isUploading = true;
        const res = await firstValueFrom(this.imageService.upload(this.selectedFile));
        this.formData.popUpImageUrl = res.url;
        this.isUploading = false;
      }

      this.landingService.updateSettings(this.formData).subscribe({
        next: () => {
          this.alertService.showAlert('Diseño de página guardado correctamente.', 'success', 'Guardado Exitoso');
          this.loadSettings();
        },
        error: (err) => {
          this.alertService.showAlert('Error al guardar: ' + err.message, 'error', 'Error');
        }
      });
    } catch (error) {
      console.error('Error saving settings', error);
      this.isUploading = false;
      this.alertService.showAlert('Error al subir la imagen.', 'error', 'Error');
    }
  }
}

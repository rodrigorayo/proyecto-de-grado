import { Injectable, signal } from '@angular/core';

export interface AlertData {
  type: 'alert' | 'confirm';
  title: string;
  message: string;
  alertType?: 'success' | 'error' | 'warning' | 'info';
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  currentAlert = signal<AlertData | null>(null);

  showAlert(message: string, alertType: 'success' | 'error' | 'warning' | 'info' = 'info', title = 'Notificación'): Promise<boolean> {
    return new Promise((resolve) => {
      this.currentAlert.set({
        type: 'alert',
        title,
        message,
        alertType,
        resolve: (val) => {
          this.currentAlert.set(null);
          resolve(val);
        }
      });
    });
  }

  showConfirm(message: string, title = 'Confirmar Acción'): Promise<boolean> {
    return new Promise((resolve) => {
      this.currentAlert.set({
        type: 'confirm',
        title,
        message,
        resolve: (val) => {
          this.currentAlert.set(null);
          resolve(val);
        }
      });
    });
  }
}

import { Injectable, signal } from '@angular/core';

export interface Toast {
  kind: 'success' | 'error';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.push({ kind: 'success', message });
  }

  error(message: string): void {
    this.push({ kind: 'error', message });
  }

  dismiss(index: number): void {
    this.toasts.update((list) => list.filter((_, position) => position !== index));
  }

  private push(toast: Toast): void {
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(this.toasts().indexOf(toast)), 5000);
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" role="status" aria-live="polite">
      @for (toast of toasts.toasts(); track $index) {
        <div class="toast" [class.toast--error]="toast.kind === 'error'">
          <span>{{ toast.message }}</span>
          <button type="button" class="toast__close" (click)="toasts.dismiss($index)">×</button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast-container.scss'
})
export class ToastContainer {
  protected readonly toasts = inject(ToastService);
}

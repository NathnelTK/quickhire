import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.auth-shell--compact]': 'compact()'
  },
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.scss'
})
export class AuthShell {
  readonly panelText = input.required<string>();
  readonly compact = input(false);
}

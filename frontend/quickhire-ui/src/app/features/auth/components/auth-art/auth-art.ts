import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-auth-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-art.html',
  styleUrl: './auth-art.scss'
})
export class AuthArt {}

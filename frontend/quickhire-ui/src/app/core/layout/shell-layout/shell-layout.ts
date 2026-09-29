import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Shell } from '../shell/shell';

@Component({
  selector: 'app-shell-layout',
  imports: [RouterOutlet, Shell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<app-shell><router-outlet /></app-shell>'
})
export class ShellLayout {}

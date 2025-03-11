import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslocoModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pruebaSequence';
}

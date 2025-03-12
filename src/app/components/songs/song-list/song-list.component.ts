import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SongService } from '../../../services/song.service';
import { SongView } from '../../../models/song.model';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { formatDuration } from '../../../shared/utils/time';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';


@Component({
  selector: 'app-song-list',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslocoModule,SpinnerComponent],
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.css']
})
export class SongListComponent implements OnInit {
  songs: SongView[] = [];
  error: string = '';
  isLoading: boolean = true;
  currentLang: string = 'en';

  constructor(
    private songService: SongService,
    private router: Router,
    private translocoService: TranslocoService
  ) {}

  // Se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.currentLang = this.translocoService.getActiveLang();
    this.fetchSongs();
  }

  toggleLanguage(): void {
    const newLang = this.currentLang === 'en' ? 'es' : 'en';
    this.translocoService.setActiveLang(newLang);
    this.currentLang = newLang;
  }

  // Obtiene la lista de canciones del servidor
  fetchSongs(): void {
    this.isLoading = true;
    this.error = '';

    this.songService.getSongs().subscribe({
      next: (songs) => {
        this.songs = songs;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar las canciones:', error);
        this.error = this.translocoService.translate('songs.errors.loadError');
        this.isLoading = false;
      }
    });
  }

  // Navega al detalle de una canción específica
  navigateToDetail(id: string): void {
    this.router.navigate(['/song', id]);
  }

  formatDuration = formatDuration;

  getCompanyNames(song: SongView): string {
    return song.companies.map(company => company.name).join(', ');
  }
} 

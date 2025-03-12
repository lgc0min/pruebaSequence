import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SongService } from '../../../services/song.service';
import { ArtistService} from '../../../services/artist.service';
import { CompanyService} from '../../../services/company.service';
import { Song, SongView, UpdateSongDTO, AVAILABLE_GENRES } from '../../../models/song.model'; 
import { Artist } from './../../../models/artist.model';
import { Company } from './../../../models/company.model';
import { TranslocoModule } from '@ngneat/transloco';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-song-detail',
  templateUrl: './song-detail.component.html',
  styleUrls: ['./song-detail.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslocoModule]
})
export class SongDetailComponent implements OnInit {
  song?: SongView;
  error: string = '';
  isEditing: boolean = false;
  editedSong?: UpdateSongDTO;
  artistName: string = '';
  
  newGenre = '';
  newCompany = '';
  filteredGenres: string[] = [];
  filteredCompanies: string[] = [];
  
  artist?: Artist;
  availableCompanies: Company[] = [];
  selectedCompanyIds: string[] = [];

  // Géneros predefinidos
  availableGenres = AVAILABLE_GENRES;

  constructor(
    private route: ActivatedRoute,
    private songService: SongService,
    private artistService: ArtistService,
    private companyService: CompanyService,
    private router: Router,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSongDetails(id);
    }
  }

  private loadSongDetails(id: string): void {
    this.songService.getSongView(id).subscribe({
      next: (songView) => {
        this.song = songView;
        this.artistService.getById(songView.artist).subscribe({
          next: (artist) => {
            this.artist = artist;
          }
        });

        this.companyService.getAll().subscribe({
          next: (companies) => {
            this.availableCompanies = companies;
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar la canción:', error);
        this.error = 'Error al cargar los datos de la canción';
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing && this.song) {
      this.editedSong = {
        ...this.song,
        artist: this.artist?.id ? Number(this.artist.id) : 0
      };
      this.artistName = this.song.artistName;
      this.selectedCompanyIds = this.song.companies.map(c => c.id);
    } else {
      this.editedSong = undefined;
      this.artistName = '';
    }
  }

  saveChanges(): void {
    if (this.editedSong && this.song?.id) {
      // Actualizamos el artista si ha cambiado
      if (this.artistName !== this.song.artistName) {
        this.artistService.getAll().subscribe({
          next: (artists) => {
            const existingArtist = artists.find(a => a.name.toLowerCase() === this.artistName.toLowerCase());
            if (existingArtist) {
              this.editedSong!.artist = Number(existingArtist.id);
              this.updateSongAndCompanies();
            } else {
              // Si el artista no existe, lo creamos
              const newArtist = {
                name: this.artistName,
                bornCity: "",
                birthdate: "",
                img: null,
                rating: 0
              };
              this.artistService.create(newArtist).subscribe({
                next: (artist) => {
                  this.editedSong!.artist = Number(artist.id);
                  this.updateSongAndCompanies();
                }
              });
            }
          }
        });
      } else {
        this.updateSongAndCompanies();
      }
    }
  }

  private updateSongAndCompanies(): void {
    if (this.editedSong && this.song?.id) {
      this.songService.updateSong(this.song.id, this.editedSong).subscribe({
        next: () => {
          this.songService.updateSongCompanies(this.song!.id!, this.selectedCompanyIds).subscribe({
            next: () => {
              this.loadSongDetails(this.song!.id!);
              this.isEditing = false;
              this.editedSong = undefined;
            }
          });
        },
        error: (error) => {
          console.error('Error al actualizar la canción:', error);
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editedSong = undefined;
  }

  deleteSong(): void {
    if (this.song?.id) {
      const message = this.translocoService.translate('songs.deleteConfirm', { title: this.song.title });
      if (confirm(message)) {
        this.songService.deleteSong(this.song.id).subscribe({
          next: () => {
            this.router.navigate(['/songs']);
          },
          error: (error) => {
            console.error('Error al eliminar la canción:', error);
          }
        });
      }
    }
  }

  filterGenres(event: any): void {
    const value = event.target.value.toLowerCase();
    this.filteredGenres = this.availableGenres
      .filter(genre => 
        genre.toLowerCase().includes(value) &&
        !this.editedSong?.genre?.includes(genre)
      );
  }

  filterCompanies(event: any): void {
    const value = event.target.value.toLowerCase();
    this.filteredCompanies = this.availableCompanies
      .filter(company => 
        company.name.toLowerCase().includes(value) &&
        !this.selectedCompanyIds.includes(company.id)
      )
      .map(company => company.name);
  }

  addGenre(genre: string): void {
    if (this.editedSong) {
      if (!this.editedSong.genre) {
        this.editedSong.genre = [];
      }
      if (!this.editedSong.genre.includes(genre)) {
        this.editedSong.genre = [...this.editedSong.genre, genre];
        this.newGenre = '';
        this.filteredGenres = [];
      }
    }
  }

  addCompany(companyName: string): void {
    const company = this.availableCompanies.find(c => c.name === companyName);
    if (company && !this.selectedCompanyIds.includes(company.id)) {
      this.selectedCompanyIds = [...this.selectedCompanyIds, company.id];
      this.newCompany = '';
      this.filteredCompanies = [];
    }
  }

  removeGenre(genre: string): void {
    if (this.editedSong?.genre) {
      this.editedSong.genre = this.editedSong.genre.filter(g => g !== genre);
    }
  }

  removeCompany(companyId: string): void {
    this.selectedCompanyIds = this.selectedCompanyIds.filter(id => id !== companyId);
  }

  getCompanyName(companyId: string): string {
    return this.availableCompanies.find(c => c.id === companyId)?.name || '';
  }
}

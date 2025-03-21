import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl} from '@angular/forms';
import { SongService } from '../../../services/song.service';
import { ArtistService} from '../../../services/artist.service';
import { CompanyService} from '../../../services/company.service';
import { Song, CreateSongDTO, AVAILABLE_GENRES } from '../../../models/song.model'; 
import { Artist } from './../../../models/artist.model';
import { Company } from './../../../models/company.model';
import { TranslocoModule } from '@ngneat/transloco';
import { parseDuration } from '../../../shared/utils/time';

// Componente para crear una nueva canción
@Component({
  selector: 'app-song-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslocoModule],
  templateUrl: './song-add.component.html',
  styleUrls: ['./song-add.component.css']
})
export class SongAddComponent implements OnInit {
  // Formulario principal para los datos de la canción
  songForm: FormGroup;
  
  // Controles para la entrada de géneros y compañías
  genreInput = new FormControl('');
  companyInput = new FormControl('');
  
  // Arrays para almacenar las selecciones del usuario
  selectedGenres: string[] = [];
  selectedCompanyIds: string[] = [];
  
  // Catálogos predefinidos de opciones
  availableGenres = AVAILABLE_GENRES;
  availableCompanies: Company[] = [];
  
  // Arrays para las sugerencias durante la escritura
  filteredGenres: string[] = [];
  filteredCompanies: Company[] = [];

  error: string = '';

  constructor(
    // Servicio para crear formularios reactivos
    private fb: FormBuilder,
    // Servicio para operaciones con canciones
    private songService: SongService,
    // Servicio para operaciones con artistas
    private artistService: ArtistService,
    // Servicio para operaciones con compañías
    private companyService: CompanyService,
    // Servicio para navegación
    private router: Router
  ) {
    // Inicialización del formulario con validaciones
    this.songForm = this.fb.group({
      title: ['', [Validators.required]],
      artistName: ['', [Validators.required]],
      poster: ['http://dummyimage.com/400x600.png/dddddd/000000'],
      genreInput: [''],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      duration: ['', [Validators.required, Validators.pattern(/^\d+:\d{2}$/)]],
      rating: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      companyInput: ['']
    });
  }

  ngOnInit(): void {
    this.loadCompanies();

    // Suscribirse a los cambios en los campos de género y compañía
    this.songForm.get('genreInput')?.valueChanges.subscribe(value => {
      if (value) {
        this.filterGenres(value);
      }
    });

    this.songForm.get('companyInput')?.valueChanges.subscribe(value => {
      if (value) {
        this.filterCompanies(value);
      }
    });
  }

  private loadCompanies(): void {
    this.companyService.getAll().subscribe({
      next: (companies) => {
        this.availableCompanies = companies;
      },
      error: (error) => {
        console.error('Error al cargar las compañías:', error);
        this.error = 'Error al cargar las compañías';
      }
    });
  }

  private filterGenres(value: string): void {
    const filterValue = value.toLowerCase();
    this.filteredGenres = this.availableGenres
      .filter(genre => 
        genre.toLowerCase().includes(filterValue) &&
        !this.selectedGenres.includes(genre)
      );
  }

  private filterCompanies(value: string): void {
    const filterValue = value.toLowerCase();
    this.filteredCompanies = this.availableCompanies
      .filter(company => 
        company.name.toLowerCase().includes(filterValue) &&
        !this.selectedCompanyIds.includes(company.id)
      );
  }

  addGenre(genre: string): void {
    if (!this.selectedGenres.includes(genre)) {
      this.selectedGenres = [...this.selectedGenres, genre];
      this.songForm.patchValue({
        genreInput: ''
      }, { emitEvent: false });
      this.filteredGenres = [];
    }
  }

  addCompany(company: Company): void {
    if (!this.selectedCompanyIds.includes(company.id)) {
      this.selectedCompanyIds = [...this.selectedCompanyIds, company.id];
      this.songForm.patchValue({
        companyInput: ''
      }, { emitEvent: false });
      this.filteredCompanies = [];
    }
  }

  removeGenre(genre: string): void {
    this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
  }

  removeCompany(companyId: string): void {
    this.selectedCompanyIds = this.selectedCompanyIds.filter(id => id !== companyId);
  }

  getCompanyName(companyId: string): string {
    return this.availableCompanies.find(c => c.id === companyId)?.name || '';
  }

  onSubmit(): void {
    if (this.songForm.valid) {
      const formValue = this.songForm.value;
      
      // Buscar o crear el artista
      this.artistService.getAll().subscribe({
        next: (artists) => {
          const existingArtist = artists.find(
            a => a.name.toLowerCase() === formValue.artistName.toLowerCase()
          );

          if (existingArtist) {
            this.createSong(Number(existingArtist.id));
          } else {
            const newArtist: Omit<Artist, 'id' | 'songs'> = {
              name: formValue.artistName,
              bornCity: '',
              birthdate: '',
              img: null,
              rating: 0
            };

            this.artistService.create(newArtist).subscribe({
              next: (artist) => {
                this.createSong(Number(artist.id));
              },
              error: (error) => {
                console.error('Error al crear el artista:', error);
                this.error = 'Error al crear el artista';
              }
            });
          }
        },
        error: (error) => {
          console.error('Error al buscar el artista:', error);
          this.error = 'Error al buscar el artista';
        }
      });
    }
  }

  private createSong(artistId: number): void {
    const formValue = this.songForm.value;
    const newSong: CreateSongDTO = {
      name: formValue.title,
      title: formValue.title,
      artist: artistId,
      poster: formValue.poster,
      genre: this.selectedGenres,
      year: formValue.year,
      duration: parseDuration(formValue.duration),
      rating: formValue.rating
    };

    this.songService.addSong(newSong, this.selectedCompanyIds).subscribe({
      next: () => {
        this.router.navigate(['/songs']);
      },
      error: (error) => {
        console.error('Error al crear la canción:', error);
        this.error = 'Error al crear la canción';
      }
    });
  }
}

import { Company } from "./company.model";
import { Artist } from "./artist.model";

// Interfaz base para entidades con ID
export interface BaseEntity {
    id: string;
    name: string;
  }
  
  export enum GenreType {
    POP = 'Pop',
    ROCK = 'Rock',
    JAZZ = 'Jazz',
    CLASSICAL = 'Classical',
    HIP_HOP = 'Hip Hop',
    RNB = 'R&B',
    ELECTRONIC = 'Electronic',
    FOLK = 'Folk',
    ALTERNATIVE = 'Alternative',
    BLUES = 'Blues',
    PSYCHEDELIC = 'Psychedelic rock'
  }
  
  // Interfaces principales
  export interface Song extends BaseEntity {
    title: string;
    artist: number; 
    poster: string;
    genre: GenreType[];
    year: number;
    duration: number;
    rating: number;
  }
  
  // Interfaces para vistas
  export interface SongView extends Omit<Song, 'name'> {
    artistName: string;
    companies: Company[];
  }
  
  // Tipos de utilidad
  export type CreateSongDTO = Omit<Song, 'id'>;
  export type UpdateSongDTO = Partial<CreateSongDTO> & { genre?: GenreType[] };
import { Company } from "./company.model";
import { Artist } from "./artist.model";

// Interfaz base para entidades con ID
export interface BaseEntity {
    id: string;
    name: string;
  }
  
  // Interfaces principales
  export interface Song extends BaseEntity {
    title: string;
    artist: number; 
    poster: string;
    genre: string[];
    year: number;
    duration: number;
    rating: number;
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

  export const AVAILABLE_GENRES = [
    GenreType.POP,
    GenreType.ROCK,
    GenreType.JAZZ,
    GenreType.CLASSICAL,
    GenreType.HIP_HOP,
    GenreType.RNB,
    GenreType.ELECTRONIC,
    GenreType.FOLK,
    GenreType.ALTERNATIVE,
    GenreType.BLUES,
    GenreType.PSYCHEDELIC
  ]; 
  
  // Interfaces para vistas
  export interface SongView extends Omit<Song, 'name'> {
    artistName: string;
    companies: Company[];
  }
  
  // Tipos de utilidad
  export type CreateSongDTO = Omit<Song, 'id'>;
  export type UpdateSongDTO = Partial<CreateSongDTO> & { genre?: string[] };
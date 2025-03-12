import { BaseEntity } from './song.model';

export interface Artist extends BaseEntity {
  bornCity: string;
  birthdate: string;
  img: string | null;
  rating: number;
  songs: number[]; 
}

// Tipos de utilidad
export type CreateArtistDTO = Omit<Artist, 'id' | 'songs'>;
export type UpdateArtistDTO = Partial<CreateArtistDTO>;
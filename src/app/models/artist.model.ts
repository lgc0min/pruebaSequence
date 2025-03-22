import { NamedEntity } from './song.model';

export interface Artist extends NamedEntity {
  bornCity: string | null;
  birthdate: string | null;
  img: string | null;
  rating: number;
  songs: number[]; 
}

// Tipos de utilidad
export type CreateArtistDTO = Omit<Artist, 'id' | 'songs'>;
export type UpdateArtistDTO = Partial<CreateArtistDTO>;
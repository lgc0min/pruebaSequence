import { BaseEntity } from './song.model';

export interface Company extends BaseEntity {
  country: string;
  createYear: number;
  employees: number;
  rating: number;
  songs: number[]; 
}

// Tipos de utilidad
export type CreateCompanyDTO = Omit<Company, 'id' | 'songs'>;
export type UpdateCompanyDTO = Partial<CreateCompanyDTO>;
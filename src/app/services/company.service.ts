import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Company, CreateCompanyDTO, UpdateCompanyDTO } from '../models/company.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/companies`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  getById(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`);
  }

  getCompaniesForSong(songId: string): Observable<Company[]> {
    return this.getAll().pipe(
      map(companies => companies.filter(company => 
        company.songs.includes(Number(songId))
      ))
    );
  }

  create(company: CreateCompanyDTO): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, company);
  }

  update(id: string, company: UpdateCompanyDTO): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${id}`, company);
  }

  updateSongs(id: string, songs: number[]): Observable<Company> {
    return this.http.patch<Company>(`${this.apiUrl}/${id}`, { songs });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 
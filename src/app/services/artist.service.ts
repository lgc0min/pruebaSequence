import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Artist, CreateArtistDTO, UpdateArtistDTO } from '../models/artist.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private apiUrl = `${environment.apiUrl}/artists`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Artist[]> {
    return this.http.get<Artist[]>(this.apiUrl);
  }

  getById(id: number | string): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/${id}`);
  }

  create(artist: CreateArtistDTO): Observable<Artist> {
    return this.http.post<Artist>(this.apiUrl, artist);
  }

  update(id: string, artist: UpdateArtistDTO): Observable<Artist> {
    return this.http.put<Artist>(`${this.apiUrl}/${id}`, artist);
  }

  updateSongs(id: string, songs: number[]): Observable<Artist> {
    return this.http.patch<Artist>(`${this.apiUrl}/${id}`, { songs });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getNextId(): Observable<number> {
    return this.getAll().pipe(
      map(artists => {
        if (artists.length === 0) return 1;
        const maxId = Math.max(...artists.map(artist => parseInt(artist.id)));
        return maxId + 1;
      })
    );
  }
} 
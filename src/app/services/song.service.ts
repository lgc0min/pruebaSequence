import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Song, SongView, CreateSongDTO, UpdateSongDTO } from '../models/song.model';
import { Artist } from '../models/artist.model';
import { environment } from '../../environments/environment';
import { ArtistService } from './artist.service';
import { CompanyService } from './company.service';

@Injectable({
  providedIn: 'root'  
})
export class SongService {
  private apiUrl = `${environment.apiUrl}/songs`;

  constructor(
    private http: HttpClient,
    private artistService: ArtistService,
    private companyService: CompanyService
  ) {}

  // READ - Obtiene todas las canciones
  getSongs(): Observable<SongView[]> {
    return this.http.get<Song[]>(this.apiUrl).pipe(
      switchMap(songs => 
        forkJoin(
          songs.map(song => this.getSongView(song.id))
        )
      )
    );
  }

  // READ - Obtiene una canción específica por su ID
  getSong(id: string): Observable<Song> {
    return this.http.get<Song>(`${this.apiUrl}/${id}`);
  }

  getSongView(id: string): Observable<SongView> {
    return this.getSong(id).pipe(
      switchMap(song => 
        forkJoin({
          artist: this.artistService.getById(song.artist),
          companies: this.companyService.getCompaniesForSong(id)
        }).pipe(
          map(({ artist, companies }) => ({
            ...song,
            artistName: artist.name,
            companies
          }))
        )
      )
    );
  }

  // CREATE - Añade una nueva canción
  addSong(song: CreateSongDTO, companyIds: string[] = [], artistName: string): Observable<Song> {
    return this.getNextId().pipe(
      switchMap(newId => {
        const songToAdd = { ...song, id: newId };
        delete (songToAdd as any).name; // Eliminar el campo name si existe
        
        // Primero verificamos si el artista existe
        return this.artistService.getAll().pipe(
          switchMap(artists => {
            const existingArtist = artists.find(a => a.name.toLowerCase() === artistName.toLowerCase());
            
            if (existingArtist) {
              // Si el artista existe, usamos su ID
              songToAdd.artist = parseInt(existingArtist.id);
              
              return this.http.post<Song>(this.apiUrl, songToAdd).pipe(
                switchMap(createdSong => {
                  const updateTasks: Observable<any>[] = [];

                  // Actualizar la lista de canciones del artista existente
                  const updatedSongs = existingArtist.songs || [];
                  updateTasks.push(
                    this.artistService.updateSongs(existingArtist.id, [...updatedSongs, parseInt(createdSong.id!)])
                  );

                  // Actualizar compañías si es necesario
                  if (companyIds.length > 0) {
                    updateTasks.push(
                      this.companyService.getAll().pipe(
                        switchMap(companies => {
                          const companyUpdates = companies
                            .filter(company => companyIds.includes(company.id))
                            .map(company => {
                              const updatedSongs = [...company.songs, parseInt(createdSong.id!)];
                              return this.companyService.updateSongs(company.id, updatedSongs);
                            });
                          return forkJoin(companyUpdates);
                        })
                      )
                    );
                  }

                  return forkJoin(updateTasks).pipe(map(() => createdSong));
                })
              );
            } else {
              // Si el artista no existe, obtenemos el siguiente ID disponible
              return this.artistService.getNextId().pipe(
                switchMap(newArtistId => {
                  const newArtist: Artist = {
                    id: newArtistId.toString(),
                    name: artistName,
                    bornCity: null,
                    birthdate: null,
                    img: null,
                    rating: 0,
                    songs: []
                  };

                  return this.artistService.create(newArtist).pipe(
                    switchMap(createdArtist => {
                      songToAdd.artist = parseInt(createdArtist.id);
                      
                      return this.http.post<Song>(this.apiUrl, songToAdd).pipe(
                        switchMap(createdSong => {
                          const updateTasks: Observable<any>[] = [];

                          // Actualizar la lista de canciones del nuevo artista
                          updateTasks.push(
                            this.artistService.updateSongs(createdArtist.id, [parseInt(createdSong.id!)])
                          );

                          // Actualizar compañías si es necesario
                          if (companyIds.length > 0) {
                            updateTasks.push(
                              this.companyService.getAll().pipe(
                                switchMap(companies => {
                                  const companyUpdates = companies
                                    .filter(company => companyIds.includes(company.id))
                                    .map(company => {
                                      const updatedSongs = [...company.songs, parseInt(createdSong.id!)];
                                      return this.companyService.updateSongs(company.id, updatedSongs);
                                    });
                                  return forkJoin(companyUpdates);
                                })
                              )
                            );
                          }

                          return forkJoin(updateTasks).pipe(map(() => createdSong));
                        })
                      );
                    })
                  );
                })
              );
            }
          })
        );
      })
    );
  }

  // UPDATE - Actualiza una canción existente
  updateSong(id: string, updatedSong: UpdateSongDTO): Observable<Song> {
    return this.getSong(id).pipe(
      switchMap(originalSong => {
        return this.http.put<Song>(`${this.apiUrl}/${id}`, updatedSong).pipe(
          switchMap(savedSong => {
            const updateTasks: Observable<any>[] = [];

            if (originalSong.artist !== savedSong.artist) {
              // Quitar la canción del artista anterior
              updateTasks.push(
                this.artistService.getById(originalSong.artist).pipe(
                  switchMap(oldArtist => {
                    const updatedSongs = oldArtist.songs.filter(songId => songId !== Number(id));
                    return this.artistService.updateSongs(oldArtist.id, updatedSongs);
                  })
                )
              );

              // Añadir la canción al nuevo artista
              updateTasks.push(
                this.artistService.getById(savedSong.artist).pipe(
                  switchMap(newArtist => {
                    const updatedSongs = [...newArtist.songs, Number(id)];
                    return this.artistService.updateSongs(newArtist.id, updatedSongs);
                  })
                )
              );
            }

            return updateTasks.length > 0 
              ? forkJoin(updateTasks).pipe(map(() => savedSong))
              : of(savedSong);
          })
        );
      })
    );
  }

  // DELETE - Elimina una canción
  deleteSong(id: string): Observable<void> {
    return this.getSong(id).pipe(
      switchMap(song => {
        const updateTasks: Observable<any>[] = [];

        // Quitar la canción del artista
        updateTasks.push(
          this.artistService.getById(song.artist).pipe(
            switchMap(artist => {
              const updatedSongs = artist.songs.filter(songId => songId !== Number(id));
              return this.artistService.updateSongs(artist.id, updatedSongs);
            })
          )
        );

        // Quitar la canción de todas las compañías
        updateTasks.push(
          this.companyService.getAll().pipe(
            switchMap(companies => {
              const companyUpdates = companies
                .filter(company => company.songs.includes(Number(id)))
                .map(company => {
                  const updatedSongs = company.songs.filter(songId => songId !== Number(id));
                  return this.companyService.updateSongs(company.id, updatedSongs);
                });
              return companyUpdates.length > 0 ? forkJoin(companyUpdates) : of(null);
            })
          )
        );

        return forkJoin(updateTasks).pipe(
          switchMap(() => this.http.delete<void>(`${this.apiUrl}/${id}`))
        );
      })
    );
  }

  // Actualiza las compañías de una canción
  updateSongCompanies(songId: string, companyIds: string[]): Observable<void> {
    return this.companyService.getAll().pipe(
      switchMap(companies => {
        const updateTasks = companies.map(company => {
          const shouldHaveSong = companyIds.includes(company.id);
          const hasSong = company.songs.includes(Number(songId));

          if (shouldHaveSong !== hasSong) {
            const updatedSongs = shouldHaveSong
              ? [...company.songs, Number(songId)]
              : company.songs.filter(id => id !== Number(songId));

            return this.companyService.updateSongs(company.id, updatedSongs);
          }
          return of(null);
        }).filter((obs): obs is Observable<any> => obs !== null);

        return updateTasks.length > 0 ? forkJoin(updateTasks).pipe(map(() => undefined)) : of(undefined);
      })
    );
  }

  private getNextId(): Observable<string> {
    return this.getSongs().pipe(
      map(songs => {
        if (songs.length === 0) return "1";
        const maxId = Math.max(...songs.map(song => parseInt(song.id)));
        return (maxId + 1).toString();
      })
    );
  }
}

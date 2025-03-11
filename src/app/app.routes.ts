import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SongDetailComponent } from './components/songs/song-detail/song-detail.component';
import { SongListComponent } from './components/songs/song-list/song-list.component';
import { SongAddComponent } from './components/songs/song-add/song-add.component';

export const appRoutes: Routes = [
    { path: '', redirectTo: '/songs', pathMatch: 'full' },
    { path: 'songs', component: SongListComponent },
    { path: 'song-add', component: SongAddComponent },
    { path: 'song/:id', component: SongDetailComponent },
    { path: '**', redirectTo: '/songs' }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }

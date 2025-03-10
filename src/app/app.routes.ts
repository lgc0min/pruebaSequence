import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SongListComponent } from './components/songs/song-list/song-list.component';
import { SongDetailComponent } from './components/songs/song-detail/song-detail.component';
import { SongAddComponent } from './components/songs/song-add/song-add.component';

export const appRoutes: Routes = [
    { path: 'songs', component: SongListComponent },
    { path: 'song/:id', component: SongDetailComponent },
    { path: 'song-add', component: SongAddComponent },
    { path: '', redirectTo: '/songs', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }

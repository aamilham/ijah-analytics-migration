import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DownloadComponent } from './download/download.component';
import { HelpComponent } from './help/help.component';
import { ContactComponent } from './contact/contact.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Rute untuk halaman Home
  { path: 'download', component: DownloadComponent }, // Rute untuk halaman Download
  { path: 'help', component: HelpComponent }, // Rute untuk halaman Help/FAQ
  { path: 'contact', component: ContactComponent }, // Rute untuk halaman Contact
  { path: 'about', component: AboutComponent }, // Rute untuk halaman About
];
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DownloadComponent } from './download/download.component';
import { HelpComponent } from './help/help.component';
import { ContactComponent } from './contact/contact.component';
import { AboutComponent } from './about/about.component';
import { ResultComponent } from './result/result.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'download', component: DownloadComponent },
  { path: 'help', component: HelpComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about', component: AboutComponent },
  { path: 'result', component: ResultComponent },
];
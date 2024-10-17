import { routes } from './app/app.routes'; // Pastikan ini sesuai
import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    // provider lainnya
  ],
});

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterModule,
    NavbarComponent,
    FooterComponent
  ],
})
export class AppComponent {
  visitorCount: number = 12345;

  ngOnInit() {
    const visitorCountElement = document.getElementById('visitor-count');
    if (visitorCountElement) {
      visitorCountElement.innerText = this.visitorCount.toString();
    }
  }
}
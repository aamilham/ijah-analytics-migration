import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Impor RouterModule
import { NavbarComponent } from './navbar/navbar.component'; // Impor NavbarComponent
import { FooterComponent } from './footer/footer.component'; // Import FooterComponent
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterModule, // Tambahkan RouterModule ke imports
    NavbarComponent,
    FooterComponent, // Tambahkan NavbarComponent jika digunakan dalam template
  ],
})
export class AppComponent {
  visitorCount: number = 12345; // Contoh, ganti dengan logika yang sesuai

  ngOnInit() {
    // Kamu bisa menambahkan logika API di sini untuk mendapatkan jumlah pengunjung
    const visitorCountElement = document.getElementById('visitor-count');
    if (visitorCountElement) {
      visitorCountElement.innerText = this.visitorCount.toString();
    }
  }
  title = 'Ijah';
}

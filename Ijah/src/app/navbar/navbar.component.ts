import { Component, OnInit, NgZone } from '@angular/core';
import { Offcanvas } from 'bootstrap';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [RouterModule], // Add RouterModule to support routing
})
export class NavbarComponent implements OnInit {
  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    // Initialize offcanvas outside Angular zone
    this.ngZone.runOutsideAngular(() => {
      const offcanvasEl = document.querySelector('.offcanvas');
      if (offcanvasEl) {
        new Offcanvas(offcanvasEl);
      }
    });
  }
}

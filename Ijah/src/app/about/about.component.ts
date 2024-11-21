import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  standalone: true,
  imports: [RouterLink]
})
export class AboutComponent implements OnInit, AfterViewInit {
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.initScrollAnimation();
  }

  private initScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.content-section').forEach((section) => {
      observer.observe(section);
    });
  }
}
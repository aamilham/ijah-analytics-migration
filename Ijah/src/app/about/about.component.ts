import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  standalone: true,
  imports: [RouterLink]
})
export class AboutComponent implements OnInit, AfterViewInit {
  private observer: IntersectionObserver | undefined;

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.setupScrollAnimations();
  }

  private setupScrollAnimations() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, options);

    // Observe all sections that should animate
    const sections = this.elementRef.nativeElement.querySelectorAll(
      '.content-section, .team-section, .full-width-map, .outer-container'
    );

    sections.forEach((section: Element) => {
      section.classList.add('scroll-animation');
      this.observer?.observe(section);
    });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare global {
  interface Window {
    google: typeof google;
  }
}

declare var google: {
  charts: {
    load: (version: string, options: { packages: string[] }) => void;
    setOnLoadCallback: (callback: () => void) => void;
  };
  visualization: any;
};

@Injectable({
  providedIn: 'root'
})
export class GoogleChartsService {
  private isLoadedSubject = new BehaviorSubject<boolean>(false);
  isLoaded$ = this.isLoadedSubject.asObservable();

  constructor() {
    this.loadGoogleCharts();
  }

  private loadGoogleCharts() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.gstatic.com/charts/loader.js';
    script.onload = () => {
      if (typeof window.google !== 'undefined') {
        window.google.charts.load('current', { 
          packages: ['sankey', 'corechart']
        });
        window.google.charts.setOnLoadCallback(() => {
          this.isLoadedSubject.next(true);
        });
      }
    };
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  waitForLoaded(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window.google !== 'undefined' && window.google.visualization) {
        resolve();
      } else {
        this.isLoaded$.subscribe((loaded) => {
          if (loaded) {
            resolve();
          }
        });
      }
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl;
  private cache = new Map<string, any[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }

  private getCachedData(key: string): any[] | null {
    const cachedData = this.cache.get(key);
    const expiry = this.cacheExpiry.get(key);
    
    if (cachedData && expiry && Date.now() < expiry) {
      return cachedData;
    }
    
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any[]): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  // Get all plants
  getPlants(): Observable<any[]> {
    const cached = this.getCachedData('plants');
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    return this.http.get<any[]>(`${this.apiUrl}/get_plants.php`).pipe(
      tap(data => {
        this.setCachedData('plants', data);
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Get all compounds
  getCompounds(): Observable<any[]> {
    const cached = this.getCachedData('compounds');
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    return this.http.get<any[]>(`${this.apiUrl}/get_compounds.php`).pipe(
      tap(data => {
        this.setCachedData('compounds', data);
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Get all proteins
  getProteins(): Observable<any[]> {
    const cached = this.getCachedData('proteins');
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    return this.http.get<any[]>(`${this.apiUrl}/get_proteins.php`).pipe(
      tap(data => {
        this.setCachedData('proteins', data);
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Get all diseases
  getDiseases(): Observable<any[]> {
    const cached = this.getCachedData('diseases');
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    return this.http.get<any[]>(`${this.apiUrl}/get_diseases.php`).pipe(
      tap(data => {
        this.setCachedData('diseases', data);
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Search based on selected items
  search(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/predict.php`, data).pipe(
      catchError(error => this.handleError(error))
    );
  }
}

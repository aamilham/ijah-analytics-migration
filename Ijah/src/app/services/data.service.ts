import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }

  // Get all plants
  getPlants(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get_plants.php`).pipe(
      tap(data => console.log('Raw plants response:', data)),
      catchError(error => this.handleError(error))
    );
  }

  // Get all compounds
  getCompounds(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get_compounds.php`).pipe(
      tap(data => console.log('Raw compounds response:', data)),
      catchError(error => this.handleError(error))
    );
  }

  // Get all proteins
  getProteins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get_proteins.php`).pipe(
      tap(data => console.log('Raw proteins response:', data)),
      catchError(error => this.handleError(error))
    );
  }

  // Get all diseases
  getDiseases(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get_diseases.php`).pipe(
      tap(data => console.log('Raw diseases response:', data)),
      catchError(error => this.handleError(error))
    );
  }

  // Search based on selected items
  search(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/predict.php`, data).pipe(
      tap(response => console.log('Raw search response:', response)),
      catchError(error => this.handleError(error))
    );
  }
}

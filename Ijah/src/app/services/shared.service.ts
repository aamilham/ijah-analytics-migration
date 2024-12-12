import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root', // Menjadikan service ini tersedia di seluruh aplikasi
})
export class SharedService {
  private plantToCompoundSource = new BehaviorSubject<any[]>([]);
  private compoundToProteinSource = new BehaviorSubject<any[]>([]);
  private proteinToDiseaseSource = new BehaviorSubject<any[]>([]);
  private plantCountSource = new BehaviorSubject<number>(0);
  private compoundCountSource = new BehaviorSubject<number>(0);
  private proteinCountSource = new BehaviorSubject<number>(0);
  private diseaseCountSource = new BehaviorSubject<number>(0);

  plantToCompoundData$ = this.plantToCompoundSource.asObservable();
  compoundToProteinData$ = this.compoundToProteinSource.asObservable();
  proteinToDiseaseData$ = this.proteinToDiseaseSource.asObservable();
  plantCount$ = this.plantCountSource.asObservable();
  compoundCount$ = this.compoundCountSource.asObservable();
  proteinCount$ = this.proteinCountSource.asObservable();
  diseaseCount$ = this.diseaseCountSource.asObservable();

  constructor(private http: HttpClient) { }

  // Method to update all counts at once from initial data
  updateCounts(counts: { plants: number, compounds: number, proteins: number, diseases: number }) {
    this.plantCountSource.next(counts.plants);
    this.compoundCountSource.next(counts.compounds);
    this.proteinCountSource.next(counts.proteins);
    this.diseaseCountSource.next(counts.diseases);
  }

  updatePlantToCompoundData(data: any[]) {
    this.plantToCompoundSource.next(data);
  }

  updateCompoundToProteinData(data: any[]) {
    this.compoundToProteinSource.next(data);
  }

  updateProteinToDiseaseData(data: any[]) {
    this.proteinToDiseaseSource.next(data);
  }

  // Metadata retrieval methods
  getPlantMetadata(id: string) {
    return this.http.get<any>(`/api/metadata/plant/${id}`);
  }

  getCompoundMetadata(id: string) {
    return this.http.get<any>(`/api/metadata/compound/${id}`);
  }

  getProteinMetadata(id: string) {
    return this.http.get<any>(`/api/metadata/protein/${id}`);
  }

  getDiseaseMetadata(id: string) {
    return this.http.get<any>(`/api/metadata/disease/${id}`);
  }
}

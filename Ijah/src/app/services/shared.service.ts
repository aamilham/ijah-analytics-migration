import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root', // Menjadikan service ini tersedia di seluruh aplikasi
})
export class SharedService {
  private plantToCompoundSource = new BehaviorSubject<any[]>([]);
  private compoundToProteinSource = new BehaviorSubject<any[]>([]);
  private proteinToDiseaseSource = new BehaviorSubject<any[]>([]);

  plantToCompoundData$ = this.plantToCompoundSource.asObservable();
  compoundToProteinData$ = this.compoundToProteinSource.asObservable();
  proteinToDiseaseData$ = this.proteinToDiseaseSource.asObservable();

  updatePlantToCompoundData(data: any[]) {
    this.plantToCompoundSource.next(data);
  }

  updateCompoundToProteinData(data: any[]) {
    this.compoundToProteinSource.next(data);
  }

  updateProteinToDiseaseData(data: any[]) {
    this.proteinToDiseaseSource.next(data);
  }
}

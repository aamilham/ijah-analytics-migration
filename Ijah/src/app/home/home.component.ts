import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule],
})
export class HomeComponent {
  // Predefined lists (filters)
  plantList: any[] = [
    { id: 1, name: 'Plant A' },
    { id: 2, name: 'Plant B' },
    { id: 3, name: 'Plant C' },
  ];
  compoundList: any[] = [
    { id: 1, name: 'Compound X' },
    { id: 2, name: 'Compound Y' },
    { id: 3, name: 'Compound Z' },
  ];
  proteinList: any[] = [
    { id: 1, name: 'Protein 1' },
    { id: 2, name: 'Protein 2' },
    { id: 3, name: 'Protein 3' },
  ];
  diseaseList: any[] = [
    { id: 1, name: 'Disease Alpha' },
    { id: 2, name: 'Disease Beta' },
    { id: 3, name: 'Disease Gamma' },
  ];

  // Selected items
  selectedPlants: any[] = [];
  selectedCompounds: any[] = [];
  selectedProteins: any[] = [];
  selectedDiseases: any[] = [];

  // Methods for Search and Reset buttons
  onSearch() {
    // Implement search functionality here
    console.log('Selected Plants:', this.selectedPlants);
    console.log('Selected Compounds:', this.selectedCompounds);
    console.log('Selected Proteins:', this.selectedProteins);
    console.log('Selected Diseases:', this.selectedDiseases);
    alert('Fungsi pencarian belum diimplementasikan.');
  }

  onReset() {
    this.selectedPlants = [];
    this.selectedCompounds = [];
    this.selectedProteins = [];
    this.selectedDiseases = [];
  }
}

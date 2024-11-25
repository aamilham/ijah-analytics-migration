import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, HttpClientModule],
  providers: [DataService]
})
export class HomeComponent implements OnInit {
  // Lists for dropdown options
  plantList: any[] = [];
  compoundList: any[] = [];
  proteinList: any[] = [];
  diseaseList: any[] = [];

  // Selected items
  selectedPlants: any[] = [];
  selectedCompounds: any[] = [];
  selectedProteins: any[] = [];
  selectedDiseases: any[] = [];

  // Loading states
  loading = false;
  searchResults: any = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.loading = true;
    let completedCalls = 0;
    const totalCalls = 4; // plants, compounds, proteins, diseases
    
    const checkComplete = () => {
      completedCalls++;
      if (completedCalls === totalCalls) {
        this.loading = false;
      }
    };
    
    this.dataService.getPlants().subscribe({
      next: (data) => {
        console.log('Plants loaded:', data);
        this.plantList = data;
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading plants:', error);
        checkComplete();
      }
    });

    this.dataService.getCompounds().subscribe({
      next: (data) => {
        console.log('Compounds loaded:', data);
        this.compoundList = data;
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading compounds:', error);
        checkComplete();
      }
    });

    this.dataService.getProteins().subscribe({
      next: (data) => {
        console.log('Proteins loaded:', data);
        this.proteinList = data;
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading proteins:', error);
        checkComplete();
      }
    });

    this.dataService.getDiseases().subscribe({
      next: (data) => {
        console.log('Diseases loaded:', data);
        this.diseaseList = data;
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading diseases:', error);
        checkComplete();
      }
    });
  }

  // Methods to check field states
  isCompoundDisabled(): boolean {
    return this.selectedPlants.length > 0 || this.selectedProteins.length > 0;
  }

  isDiseaseDisabled(): boolean {
    return this.selectedPlants.length > 0 || this.selectedProteins.length > 0;
  }

  isPlantDisabled(): boolean {
    return this.selectedCompounds.length > 0 || this.selectedDiseases.length > 0;
  }

  isProteinDisabled(): boolean {
    return this.selectedCompounds.length > 0 || this.selectedDiseases.length > 0;
  }

  // Methods for Search and Reset buttons
  onSearch() {
    this.loading = true;
    const searchData = {
      plants: this.selectedPlants.map(p => p.id),
      compounds: this.selectedCompounds.map(c => c.id),
      proteins: this.selectedProteins.map(p => p.id),
      diseases: this.selectedDiseases.map(d => d.id)
    };

    this.dataService.search(searchData).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.loading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.loading = false;
        alert('An error occurred during search. Please try again.');
      }
    });
  }

  onReset() {
    this.selectedPlants = [];
    this.selectedCompounds = [];
    this.selectedProteins = [];
    this.selectedDiseases = [];
    this.searchResults = null;
  }
}
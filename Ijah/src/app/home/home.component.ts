import { Component, OnInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgSelectModule, NgSelectComponent } from '@ng-select/ng-select';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgSelectModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  plantList: any[] = [];
  compoundList: any[] = [];
  proteinList: any[] = [];
  diseaseList: any[] = [];

  filteredPlantList: any[] = [];
  filteredCompoundList: any[] = [];
  filteredProteinList: any[] = [];
  filteredDiseaseList: any[] = [];

  selectedPlants: any[] = [];
  selectedCompounds: any[] = [];
  selectedProteins: any[] = [];
  selectedDiseases: any[] = [];

  userMessage = '';
  loading = false;
  searchResults: any = null;

  @ViewChildren('ngSelect') ngSelects!: QueryList<NgSelectComponent>;
  private activeDropdown: string | null = null;
  private searchDebouncer: any;
  private readonly MINIMUM_SEARCH_LENGTH = 1;
  private searchDebounceTime = 100;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAllData();
    this.initializeFilteredLists();
  }

  async loadAllData() {
    try {
      const [plants, compounds, proteins, diseases] = await Promise.all([
        this.dataService.getPlants().toPromise(),
        this.dataService.getCompounds().toPromise(),
        this.dataService.getProteins().toPromise(),
        this.dataService.getDiseases().toPromise()
      ]);

      this.plantList = (plants || []).sort((a, b) => a.name.localeCompare(b.name));
      this.compoundList = (compounds || []).sort((a, b) => a.name.localeCompare(b.name));
      this.proteinList = (proteins || []).sort((a, b) => a.name.localeCompare(b.name));
      this.diseaseList = (diseases || []).sort((a, b) => a.name.localeCompare(b.name));

      this.initializeFilteredLists();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  initializeFilteredLists() {
    const initialItems = 50;
    this.filteredPlantList = this.plantList.slice(0, initialItems);
    this.filteredCompoundList = this.compoundList.slice(0, initialItems);
    this.filteredProteinList = this.proteinList.slice(0, initialItems);
    this.filteredDiseaseList = this.diseaseList.slice(0, initialItems);
  }

  onSearchChange(event: { term: string; items: any[] }) {
    if (this.searchDebouncer) {
      clearTimeout(this.searchDebouncer);
    }

    this.searchDebouncer = setTimeout(() => {
      if (!event?.term || event.term.length < this.MINIMUM_SEARCH_LENGTH) {
        this.resetFilteredList(this.activeDropdown);
        return;
      }

      const searchTerm = event.term.toLowerCase();
      this.performSearch(searchTerm);
    }, this.searchDebounceTime);
  }

  private performSearch(searchTerm: string) {
    const binarySearch = (list: any[], term: string, maxResults: number = 50) => {
      return list
        .filter(item => item.name.toLowerCase().includes(term))
        .slice(0, maxResults);
    };

    switch(this.activeDropdown) {
      case 'plant':
        this.filteredPlantList = binarySearch(this.plantList, searchTerm);
        break;
      case 'compound':
        this.filteredCompoundList = binarySearch(this.compoundList, searchTerm);
        break;
      case 'protein':
        this.filteredProteinList = binarySearch(this.proteinList, searchTerm);
        break;
      case 'disease':
        this.filteredDiseaseList = binarySearch(this.diseaseList, searchTerm);
        break;
    }
  }

  private resetFilteredList(type: string | null) {
    const initialItems = 50;
    switch(type) {
      case 'plant':
        this.filteredPlantList = this.plantList.slice(0, initialItems);
        break;
      case 'compound':
        this.filteredCompoundList = this.compoundList.slice(0, initialItems);
        break;
      case 'protein':
        this.filteredProteinList = this.proteinList.slice(0, initialItems);
        break;
      case 'disease':
        this.filteredDiseaseList = this.diseaseList.slice(0, initialItems);
        break;
    }
  }

  onOpen(event: any, type: string) {
    this.activeDropdown = type;
    if (this.searchDebouncer) {
      clearTimeout(this.searchDebouncer);
    }

    switch(type) {
      case 'plant':
        this.filteredPlantList = this.plantList.slice(0, 50);
        break;
      case 'compound':
        this.filteredCompoundList = this.compoundList.slice(0, 50);
        break;
      case 'protein':
        this.filteredProteinList = this.proteinList.slice(0, 50);
        break;
      case 'disease':
        this.filteredDiseaseList = this.diseaseList.slice(0, 50);
        break;
    }
  }

  onClose() {
    this.activeDropdown = null;
    if (this.searchDebouncer) {
      clearTimeout(this.searchDebouncer);
    }
  }

  onSelect() {
    // optional logic on select
  }

  hasSelectedItems(): boolean {
    return this.selectedPlants.length > 0 ||
           this.selectedCompounds.length > 0 ||
           this.selectedProteins.length > 0 ||
           this.selectedDiseases.length > 0;
  }

  onSearch() {
    if (this.loading) return;

    const searchData = {
      plants: this.selectedPlants.map(p => p.name),
      compounds: this.selectedCompounds.map(c => c.name),
      proteins: this.selectedProteins.map(pr => pr.name),
      diseases: this.selectedDiseases.map(d => d.name),
      user_msg: this.userMessage
    };

    this.loading = true;
    this.searchResults = null;

    this.dataService.search(searchData).subscribe({
      next: (results: any) => {
        this.searchResults = results;
        this.loading = false;
        const selectedType = this.selectedPlants.length > 0 ? 'plant' :
                             this.selectedCompounds.length > 0 ? 'compound' :
                             this.selectedProteins.length > 0 ? 'protein' :
                             this.selectedDiseases.length > 0 ? 'disease' : '';

        sessionStorage.setItem('searchResults', JSON.stringify(results));

        this.router.navigate(['/result'], { queryParams: { type: selectedType } });
      },
      error: (error: Error) => {
        console.error('Search error:', error);
        this.loading = false;
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

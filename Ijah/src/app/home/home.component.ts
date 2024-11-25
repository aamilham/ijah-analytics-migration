import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DataService } from '../services/data.service';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, HttpClientModule],
  providers: [DataService]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
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

  @ViewChildren('ngSelect') ngSelects!: QueryList<NgSelectComponent>;
  private searchInputCache = new WeakMap<HTMLElement, HTMLInputElement>();
  private selectInstances = new WeakMap<HTMLElement, NgSelectComponent>();
  private animationFrame: number | null = null;
  private readonly debounceTime = 16; // Reduced to 16ms (1 frame)

  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadAllData();
  }

  ngAfterViewInit() {
    // Cache select instances and search inputs
    this.ngSelects.forEach(select => {
      if (select.element) {
        this.selectInstances.set(select.element, select);
        const input = select.element.querySelector('.ng-select-container input') as HTMLInputElement;
        if (input) {
          this.searchInputCache.set(select.element, input);
        }
      }
    });

    // Pre-bind event handlers
    this.clearSearchInput = this.clearSearchInput.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onOpen = this.onOpen.bind(this);
  }

  ngOnDestroy() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.searchInputCache = new WeakMap();
    this.selectInstances = new WeakMap();
  }

  private scheduleUpdate(callback: () => void) {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.animationFrame = requestAnimationFrame(() => {
      callback();
      this.animationFrame = null;
      // Trigger change detection after the update
      this.cdr.detectChanges();
    });
  }

  private updateSearchInput(element: HTMLElement, value: string = '') {
    const input = this.searchInputCache.get(element);
    const select = this.selectInstances.get(element);
    
    if (!input || !select) return;

    this.scheduleUpdate(() => {
      // Update the visible input
      input.value = value;
      
      // Update ng-select internal state
      select.searchTerm = value;
      select.itemsList.resetFilteredItems();
      select.itemsList.markSelectedOrDefault(select.markFirst);
      
      // Notify ng-select of changes
      select.detectChanges();
    });
  }

  clearSearchInput(event: any) {
    const element = event?.currentTarget;
    if (!element) return;
    
    this.updateSearchInput(element);
  }

  onSearchChange(event: { term: string, items: any[] }) {
    if (!event?.term) return;
    
    // Store term in memory instead of DOM
    const term = event.term;
    if (document.activeElement instanceof HTMLElement) {
      const select = document.activeElement.closest('.ng-select');
      if (select instanceof HTMLElement) {
        this.updateSearchInput(select, term);
      }
    }
  }

  onOpen(event: any) {
    const element = event?.currentTarget;
    if (!element) return;
    
    this.updateSearchInput(element);
  }

  // Optimize data loading
  loadAllData() {
    this.loading = true;

    // Load data in parallel
    Promise.all([
      this.dataService.getPlants().toPromise(),
      this.dataService.getCompounds().toPromise(),
      this.dataService.getProteins().toPromise(),
      this.dataService.getDiseases().toPromise()
    ]).then(([plants, compounds, proteins, diseases]) => {
      this.scheduleUpdate(() => {
        this.plantList = plants || [];
        this.compoundList = compounds || [];
        this.proteinList = proteins || [];
        this.diseaseList = diseases || [];
        this.loading = false;
      });
    }).catch(error => {
      console.error('Error loading data:', error);
      this.loading = false;
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

  onFocus(event: any) {
    const input = event.target;
    if (input) {
      const container = input.closest('.ng-select-container');
      if (container) {
        const placeholder = container.querySelector('.ng-placeholder');
        if (placeholder) {
          placeholder.style.display = 'none';
        }
      }
    }
  }
}
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
  // Lists for dropdowns
  plantList: any[] = [];
  compoundList: any[] = [];
  proteinList: any[] = [];
  diseaseList: any[] = [];

  // Filtered lists
  filteredPlantList: any[] = [];
  filteredCompoundList: any[] = [];
  filteredProteinList: any[] = [];
  filteredDiseaseList: any[] = [];

  // Selected items
  selectedPlants: any[] = [];
  selectedCompounds: any[] = [];
  selectedProteins: any[] = [];
  selectedDiseases: any[] = [];

  // Loading states
  loading = false;
  searchResults: any = null;

  private readonly MINIMUM_SEARCH_LENGTH = 1;
  private searchDebounceTime = 100;
  private searchDebouncer: any;

  @ViewChildren('ngSelect') ngSelects!: QueryList<NgSelectComponent>;
  private activeDropdown: string | null = null;
  private searchInputCache = new Map<HTMLElement, HTMLInputElement>();
  private selectInstances = new Map<HTMLElement, NgSelectComponent>();
  private animationFrame: number | null = null;
  private readonly debounceTime = 16; // Reduced to 16ms (1 frame)

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize the Map to store NgSelect instances
    this.selectInstances = new Map<HTMLElement, NgSelectComponent>();
    
    // Pre-bind event handlers
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  ngOnInit() {
    this.loadAllData();
    this.initializeFilteredLists();
    this.loadMemoFromLocalStorage();
  }

  ngAfterViewInit() {
    // Store references to NgSelect instances
    this.ngSelects.forEach(select => {
      this.selectInstances.set(select.element, select);
      const input = select.element.querySelector('.ng-select-container input') as HTMLInputElement;
      if (input) {
        this.searchInputCache.set(select.element, input);
      }
    });
  }

  ngOnDestroy() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private scheduleUpdate(callback: () => void) {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.animationFrame = requestAnimationFrame(() => {
      callback();
      this.cdr.detectChanges();
    });
  }

  private clearNgSelectInput(select: NgSelectComponent) {
    select.searchTerm = '';
    const searchInput = select.element.querySelector('.ng-select-container input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    select.itemsList.resetFilteredItems();
    this.initializeFilteredLists();
    select.detectChanges();
  }

  onOpen(event: any, type: string) {
    this.activeDropdown = type;
    if (this.searchDebouncer) {
      clearTimeout(this.searchDebouncer);
    }
    
    // Pre-load data for the opened dropdown
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

  onSearchChange(event: { term: string, items: any[] }) {
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

  onClose() {
    this.activeDropdown = null;
    if (this.searchDebouncer) {
      clearTimeout(this.searchDebouncer);
    }
  }

  initializeFilteredLists() {
    const initialItems = 50;
    this.filteredPlantList = this.plantList.slice(0, initialItems);
    this.filteredCompoundList = this.compoundList.slice(0, initialItems);
    this.filteredProteinList = this.proteinList.slice(0, initialItems);
    this.filteredDiseaseList = this.diseaseList.slice(0, initialItems);
  }

  onAdd() {
    requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        const select = activeElement.closest('.ng-select');
        if (select instanceof HTMLElement) {
          const ngSelect = this.selectInstances.get(select);
          if (ngSelect) {
            this.clearNgSelectInput(ngSelect);
            ngSelect.open();
          }
        }
      }
    });
  }

  onSelect() {
    requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        const select = activeElement.closest('.ng-select');
        if (select instanceof HTMLElement) {
          const ngSelect = this.selectInstances.get(select);
          if (ngSelect) {
            this.clearNgSelectInput(ngSelect);
            ngSelect.open();
            this.saveMemoToLocalStorage();
          }
        }
      }
    });
  }

  async loadAllData() {
    try {
      // Load data in parallel
      const [plants, compounds, proteins, diseases] = await Promise.all([
        this.dataService.getPlants().toPromise(),
        this.dataService.getCompounds().toPromise(),
        this.dataService.getProteins().toPromise(),
        this.dataService.getDiseases().toPromise()
      ]);

      // Sort data alphabetically for faster searching
      this.plantList = (plants || []).sort((a, b) => a.name.localeCompare(b.name));
      this.compoundList = (compounds || []).sort((a, b) => a.name.localeCompare(b.name));
      this.proteinList = (proteins || []).sort((a, b) => a.name.localeCompare(b.name));
      this.diseaseList = (diseases || []).sort((a, b) => a.name.localeCompare(b.name));

      // Initialize filtered lists with sorted data
      this.initializeFilteredLists();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  onSearch() {
    if (this.loading) return;

    const searchData = {
      plants: this.selectedPlants,
      compounds: this.selectedCompounds,
      proteins: this.selectedProteins,
      diseases: this.selectedDiseases
    };

    this.loading = true;
    this.searchResults = null;

    this.dataService.search(searchData).subscribe({
      next: (results: any) => {
        this.searchResults = results;
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Search error:', error);
        this.loading = false;
      }
    });
  }

  getPlantPlaceholder(): string {
    return this.selectedCompounds.length > 0 ? '' : 'Search';
  }

  getCompoundPlaceholder(): string {
    return this.selectedPlants.length > 0 ? '' : 'Search';
  }

  getProteinPlaceholder(): string {
    return this.selectedDiseases.length > 0 ? '' : 'Search';
  }

  getDiseasePlaceholder(): string {
    return this.selectedProteins.length > 0 ? '' : 'Search';
  }

  isPlantDisabled(): boolean {
    return this.loading || this.selectedCompounds.length > 0;
  }

  isCompoundDisabled(): boolean {
    return this.loading || this.selectedPlants.length > 0;
  }

  isProteinDisabled(): boolean {
    return this.loading || this.selectedDiseases.length > 0;
  }

  isDiseaseDisabled(): boolean {
    return this.loading || this.selectedProteins.length > 0;
  }

  onReset() {
    this.selectedPlants = [];
    this.selectedCompounds = [];
    this.selectedProteins = [];
    this.selectedDiseases = [];
    this.searchResults = null;
    this.saveMemoToLocalStorage();
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

  private saveMemoToLocalStorage() {
    const memo = {
      plants: this.selectedPlants,
      compounds: this.selectedCompounds,
      proteins: this.selectedProteins,
      diseases: this.selectedDiseases,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('ijah-search-memo', JSON.stringify(memo));
  }

  private loadMemoFromLocalStorage() {
    const memoStr = localStorage.getItem('ijah-search-memo');
    if (memoStr) {
      try {
        const memo = JSON.parse(memoStr);
        this.selectedPlants = memo.plants || [];
        this.selectedCompounds = memo.compounds || [];
        this.selectedProteins = memo.proteins || [];
        this.selectedDiseases = memo.diseases || [];
      } catch (e) {
        console.error('Error loading memo:', e);
      }
    }
  }
}
import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DataService } from '../services/data.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared.service';


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
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService,
    private router: Router
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
    this.loadInitialData();
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
    if (!event || !event.target) return;
    
    this.activeDropdown = type;
    const element = event.target.closest('.ng-select');
    if (!element) return;
    
    const select = this.selectInstances.get(element);
    if (select) {
      const searchInput = this.searchInputCache.get(element);
      if (searchInput) {
        this.animationFrame = requestAnimationFrame(() => searchInput.focus());
      }
    }
  }

  onSearchChange(event: { term: string, items: any[] }) {
    if (this.searchDebouncer) {
      clearTimeout(this.searchDebouncer);
    }

    this.searchDebouncer = setTimeout(() => {
      if (!event?.term) {
        this.resetFilteredList(this.activeDropdown);
        return;
      }

      // Trim the search term and normalize spaces
      const cleanTerm = event.term.trim().replace(/\s+/g, ' ');
      
      if (cleanTerm.length < this.MINIMUM_SEARCH_LENGTH) {
        this.resetFilteredList(this.activeDropdown);
        return;
      }
      
      this.performSearch(cleanTerm);
    }, this.searchDebounceTime);
  }

  private resetFilteredList(type: string | null) {
    const initialItems = 50;
    switch(type) {
      case 'plant':
        // Filter out selected plants
        this.filteredPlantList = this.plantList
          .filter(plant => !this.selectedPlants.some(selected => selected.id === plant.id))
          .slice(0, initialItems);
        break;
      case 'compound':
        // Filter out selected compounds
        this.filteredCompoundList = this.compoundList
          .filter(compound => !this.selectedCompounds.some(selected => selected.id === compound.id))
          .slice(0, initialItems);
        break;
      case 'protein':
        // Filter out selected proteins
        this.filteredProteinList = this.proteinList
          .filter(protein => !this.selectedProteins.some(selected => selected.id === protein.id))
          .slice(0, initialItems);
        break;
      case 'disease':
        // Filter out selected diseases
        this.filteredDiseaseList = this.diseaseList
          .filter(disease => !this.selectedDiseases.some(selected => selected.id === disease.id))
          .slice(0, initialItems);
        break;
    }
  }

  private performSearch(searchTerm: string) {
    // Split search terms and ensure no empty strings or extra spaces
    const searchWords = searchTerm
      .toLowerCase()
      .split(' ')
      .filter((word: string) => word.length > 0)
      .map((word: string) => word.trim());
    
    const searchInList = (list: any[], selectedItems: any[] = [], maxResults: number = 50) => {
      const scores = new Map<any, number>();
      
      // Filter out already selected items
      const availableItems = list.filter(item => 
        !selectedItems.some(selected => selected.id === item.id)
      );
      
      availableItems.forEach(item => {
        const name = item.name.toLowerCase().trim();
        let score = 0;
        
        searchWords.forEach(word => {
          // Exact match gets highest score
          if (name === word) {
            score += 100;
          }
          // Starting with the word gets high score
          else if (name.startsWith(word)) {
            score += 75;
          }
          // Word appears in the middle gets medium score
          else if (name.includes(word)) {
            score += 50;
          }
          // Individual parts match (for handling first/last names)
          else {
            const nameParts = name.split(' ')
              .filter((part: string) => part.length > 0);
            nameParts.forEach((part: string) => {
              const cleanPart = part.trim();
              if (cleanPart === word) {
                score += 40;
              } else if (cleanPart.startsWith(word)) {
                score += 30;
              } else if (cleanPart.includes(word)) {
                score += 20;
              }
            });
          }
        });
        
        if (score > 0) {
          scores.set(item, score);
        }
      });
      
      return Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxResults)
        .map(([item]) => item);
    };

    // Update filtered lists based on search results, excluding selected items
    switch(this.activeDropdown) {
      case 'plant':
        this.filteredPlantList = searchInList(this.plantList, this.selectedPlants);
        break;
      case 'compound':
        this.filteredCompoundList = searchInList(this.compoundList, this.selectedCompounds);
        break;
      case 'protein':
        this.filteredProteinList = searchInList(this.proteinList, this.selectedProteins);
        break;
      case 'disease':
        this.filteredDiseaseList = searchInList(this.diseaseList, this.selectedDiseases);
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

  loadInitialData() {
    this.loading = true;
    Promise.all([
      this.dataService.getPlants().toPromise(),
      this.dataService.getCompounds().toPromise(),
      this.dataService.getProteins().toPromise(),
      this.dataService.getDiseases().toPromise()
    ]).then(([plants, compounds, proteins, diseases]) => {
      this.plantList = plants || [];
      this.compoundList = compounds || [];
      this.proteinList = proteins || [];
      this.diseaseList = diseases || [];
      
      this.filteredPlantList = [...this.plantList];
      this.filteredCompoundList = [...this.compoundList];
      this.filteredProteinList = [...this.proteinList];
      this.filteredDiseaseList = [...this.diseaseList];
      
      this.loading = false;
    }).catch(error => {
      console.error('Error loading data:', error);
      this.loading = false;
    });
  }

  onSearch() {
    if (this.loading) return;

    // Get selected types
    const selectedTypes = {
      plants: this.selectedPlants.length > 0,
      compounds: this.selectedCompounds.length > 0,
      proteins: this.selectedProteins.length > 0,
      diseases: this.selectedDiseases.length > 0
    };

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
        // Update data in SharedService
        this.sharedService.updatePlantToCompoundData(results.plant_vs_compound || []);
        this.sharedService.updateCompoundToProteinData(results.compound_vs_protein || []);
        this.sharedService.updateProteinToDiseaseData(results.protein_vs_disease || []);
        
        // Navigate to result page with counts and selected types
        const queryParams = {
          data: JSON.stringify({
            counts: {
              plants: results.counts?.plants || 0,
              compounds: results.counts?.compounds || 0,
              proteins: results.counts?.proteins || 0,
              diseases: results.counts?.diseases || 0
            },
            selectedTypes
          })
        };
        
        this.loading = false;
        this.router.navigate(['/result'], { queryParams });
      },
      error: (error: Error) => {
        console.error('Search error:', error);
        this.loading = false;
      }
    });
  }

  getPlantPlaceholder(): string {
    return this.isPlantDisabled() ? '' : 'Search';
  }

  getCompoundPlaceholder(): string {
    return this.isCompoundDisabled() ? '' : 'Search';
  }

  getProteinPlaceholder(): string {
    return this.isProteinDisabled() ? '' : 'Search';
  }

  getDiseasePlaceholder(): string {
    return this.isDiseaseDisabled() ? '' : 'Search';
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

  // Add this method to check if any items are selected
  hasSelectedItems(): boolean {
    return this.selectedPlants.length > 0 ||
           this.selectedCompounds.length > 0 ||
           this.selectedProteins.length > 0 ||
           this.selectedDiseases.length > 0;
  }
}
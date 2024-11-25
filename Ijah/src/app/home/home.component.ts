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

  @ViewChildren('ngSelect') ngSelects!: QueryList<NgSelectComponent>;
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

  onSearchChange(event: { term: string, items: any[] }) {
    if (!event?.term) {
      this.initializeFilteredLists();
      return;
    }
    
    const searchTerm = event.term.toLowerCase();
    
    if (document.activeElement instanceof HTMLElement) {
      const select = document.activeElement.closest('.ng-select');
      if (select) {
        const selectId = select.getAttribute('id');
        switch(selectId) {
          case 'plant-select':
            this.filteredPlantList = this.plantList.filter(item => 
              item.name.toLowerCase().includes(searchTerm)
            );
            break;
          case 'compound-select':
            this.filteredCompoundList = this.compoundList.filter(item => 
              item.name.toLowerCase().includes(searchTerm)
            );
            break;
          case 'protein-select':
            this.filteredProteinList = this.proteinList.filter(item => 
              item.name.toLowerCase().includes(searchTerm)
            );
            break;
          case 'disease-select':
            this.filteredDiseaseList = this.diseaseList.filter(item => 
              item.name.toLowerCase().includes(searchTerm)
            );
            break;
        }
      }
    }
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
          }
        }
      }
    });
  }

  onOpen(event: any) {
    const element = event?.currentTarget;
    if (!element) return;
    
    const select = this.selectInstances.get(element);
    if (select) {
      this.clearNgSelectInput(select);
    }
  }

  onClose() {
    if (document.activeElement instanceof HTMLElement) {
      const select = document.activeElement.closest('.ng-select');
      if (select instanceof HTMLElement) {
        const ngSelect = this.selectInstances.get(select);
        if (ngSelect) {
          this.clearNgSelectInput(ngSelect);
        }
      }
    }
  }

  async loadAllData() {
    try {
      const [plants, compounds, proteins, diseases] = await Promise.all([
        this.dataService.getPlants().toPromise(),
        this.dataService.getCompounds().toPromise(),
        this.dataService.getProteins().toPromise(),
        this.dataService.getDiseases().toPromise()
      ]);

      this.plantList = plants || [];
      this.compoundList = compounds || [];
      this.proteinList = proteins || [];
      this.diseaseList = diseases || [];

      this.initializeFilteredLists();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  initializeFilteredLists() {
    this.filteredPlantList = [...this.plantList];
    this.filteredCompoundList = [...this.compoundList];
    this.filteredProteinList = [...this.proteinList];
    this.filteredDiseaseList = [...this.diseaseList];
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

  isPlantDisabled(): boolean {
    return this.loading;
  }

  isCompoundDisabled(): boolean {
    return this.loading;
  }

  isProteinDisabled(): boolean {
    return this.loading;
  }

  isDiseaseDisabled(): boolean {
    return this.loading;
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
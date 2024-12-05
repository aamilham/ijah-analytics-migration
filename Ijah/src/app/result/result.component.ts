import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ActivatedRoute } from '@angular/router';
import * as Highcharts from 'highcharts';
import { MatTableDataSource } from '@angular/material/table';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

// Initialize Chart.js modules
Chart.register(...registerables);

// Interfaces for table data
interface PlantToCompoundData {
  plantLatinName: string;
  localPlantName: string;
  compoundCAS: string;
  compoundCommonName: string;
  compoundIUPAC: string;
  dataSource: string;
  confidenceScore: number;
}

interface CompoundToProteinData {
  compoundCAS: string;
  compoundCommonName: string;
  compoundIUPAC: string;
  uniprotID: string;
  uniprotProteinName: string;
  pdbIDs: string;
  dataSource: string;
  confidenceScore: number;
}

interface ProteinToDiseaseData {
  uniprotID: string;
  proteinName: string;
  pdbIDs: string;
  omimID: string;
  diseaseName: string;
  dataSource: string;
  confidenceScore: number;
}

interface PlantMetadata {
  latinName: string;
  localName: string;
}

interface CompoundMetadata {
  casId: string;
  pubchemName: string;
  iupacName: string;
  knapsackId: string;
  keggId: string;
  pubchemId: string;
  drugbankId: string;
}

interface ProteinMetadata {
  casId: string;
  keggId: string;
  pubchemId: string;
  drugbankId: string;
}

interface DiseaseMetadata {
  omimId: string;
  diseaseName: string;
}

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    HighchartsChartModule,
    MatTableModule,
    MatTabsModule
  ]
})
export class ResultComponent implements OnInit {
  private connectivityChart: Chart | undefined;
  private statusChart: Chart | undefined;

  // Highcharts
  Highcharts: typeof Highcharts = Highcharts;
  sankeyOptions: Highcharts.Options | undefined;
  private sankeyModuleLoaded = false;

  // Columns for tables
  plantToCompoundColumns: string[] = [
    'plantLatinName', 
    'localPlantName', 
    'compoundCAS', 
    'compoundCommonName', 
    'compoundIUPAC', 
    'dataSource', 
    'confidenceScore'
  ];

  compoundToProteinColumns: string[] = [
    'compoundCAS', 
    'compoundCommonName', 
    'compoundIUPAC', 
    'uniprotID', 
    'uniprotProteinName', 
    'pdbIDs', 
    'dataSource', 
    'confidenceScore'
  ];

  proteinToDiseaseColumns: string[] = [
    'uniprotID', 
    'proteinName', 
    'pdbIDs', 
    'omimID', 
    'diseaseName', 
    'dataSource', 
    'confidenceScore'
  ];

  plantMetadataColumns: string[] = ['latinName', 'localName'];
  compoundMetadataColumns: string[] = ['casId', 'pubchemName', 'iupacName', 'knapsackId', 'keggId', 'pubchemId', 'drugbankId'];
  proteinMetadataColumns: string[] = ['casId', 'keggId', 'pubchemId', 'drugbankId'];
  diseaseMetadataColumns: string[] = ['omimId', 'diseaseName'];


  // Data sources for tables
  plantToCompoundDataSource = new MatTableDataSource<PlantToCompoundData>([
    {
      plantLatinName: 'Example Plant',
      localPlantName: 'Local Name',
      compoundCAS: '123-45-6',
      compoundCommonName: 'Example Compound',
      compoundIUPAC: 'IUPAC Name',
      dataSource: 'Example Database',
      confidenceScore: 0.85
    }
  ]);

  compoundToProteinDataSource = new MatTableDataSource<CompoundToProteinData>([
    {
      compoundCAS: '123-45-6',
      compoundCommonName: 'Example Compound',
      compoundIUPAC: 'IUPAC Name',
      uniprotID: 'P12345',
      uniprotProteinName: 'Example Protein',
      pdbIDs: '1ABC',
      dataSource: 'Example Database',
      confidenceScore: 0.75
    }
  ]);

  proteinToDiseaseDataSource = new MatTableDataSource<ProteinToDiseaseData>([
    {
      uniprotID: 'P12345',
      proteinName: 'Example Protein',
      pdbIDs: '1ABC',
      omimID: '123456',
      diseaseName: 'Example Disease',
      dataSource: 'Example Database',
      confidenceScore: 0.90
    }
  ]);

  plantMetadataSource = new MatTableDataSource<PlantMetadata>([
    { latinName: 'Example Plant', localName: 'Local Name' }
  ]);

  compoundMetadataSource = new MatTableDataSource<CompoundMetadata>([
    {
      casId: '123-45-6',
      pubchemName: 'Example Compound',
      iupacName: 'IUPAC Name',
      knapsackId: 'KNP123',
      keggId: 'KEGG123',
      pubchemId: 'PUB123',
      drugbankId: 'DB123'
    }
  ]);

  proteinMetadataSource = new MatTableDataSource<ProteinMetadata>([
    {
      casId: '123-45-6',
      keggId: 'KEGG123',
      pubchemId: 'PUB123',
      drugbankId: 'DB123'
    }
  ]);

  diseaseMetadataSource = new MatTableDataSource<DiseaseMetadata>([
    { omimId: '123456', diseaseName: 'Example Disease' }
  ]);

  // Selected states
  isPlantSelected: boolean = false;
  isCompoundSelected: boolean = false;
  isProteinSelected: boolean = false;
  isDiseaseSelected: boolean = false;

  constructor(private route: ActivatedRoute) {
    // Initialize Highcharts Sankey module
    this.loadSankeyModule().then(() => {
      this.sankeyModuleLoaded = true;
      this.initializeHighchartsOptions();
      this.initializeCharts();
    });
  }

  private async loadSankeyModule() {
    try {
      const sankeyInit = await import('highcharts/modules/sankey');
      sankeyInit.default(Highcharts);
    } catch (error) {
      console.error('Error loading Sankey module:', error);
    }
  }

  private initializeHighchartsOptions() {
    this.sankeyOptions = {
      chart: {
        type: 'sankey'
      },
      title: {
        text: undefined
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        sankey: {
          dataLabels: {
            enabled: true,
            format: '{point.name}'
          },
          tooltip: {
            headerFormat: '',
            pointFormat: '<b>{point.fromNode}</b> → <b>{point.toNode}</b><br/>Weight: <b>{point.weight}</b>'
          }
        }
      },
      series: [{
        type: 'sankey',
        name: 'Connectivity Flow',
        data: [
          { from: 'Plant A', to: 'Compound X', weight: 5 },
          { from: 'Plant B', to: 'Compound Y', weight: 3 },
          { from: 'Compound X', to: 'Protein Alpha', weight: 4 },
          { from: 'Compound Y', to: 'Protein Beta', weight: 2 },
          { from: 'Protein Alpha', to: 'Disease 1', weight: 3 },
          { from: 'Protein Beta', to: 'Disease 2', weight: 2 }
        ]
      }]
    };
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // Check which type was selected from home page
      const selectedType = params['type']?.toLowerCase();
      this.isPlantSelected = selectedType === 'plant';
      this.isCompoundSelected = selectedType === 'compound';
      this.isProteinSelected = selectedType === 'protein';
      this.isDiseaseSelected = selectedType === 'disease';
    });
  }

  private initializeCharts() {
    // Initialize Connectivity Pie Chart
    const connectivityCtx = document.getElementById('connectivityPieChart') as HTMLCanvasElement;
    if (connectivityCtx) {
      this.connectivityChart = new Chart(connectivityCtx, {
        type: 'pie',
        data: {
          labels: ['Protein-Disease', 'Plant-Compound', 'Compound-Protein'],
          datasets: [{
            data: [30, 40, 30],
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // Initialize Status Doughnut Chart
    const statusCtx = document.getElementById('statusDoughnutChart') as HTMLCanvasElement;
    if (statusCtx) {
      this.statusChart = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Known by Experiment', 'Unknown', 'Known by Prediction', 'Undefined'],
          datasets: [{
            data: [25, 25, 25, 25],
            backgroundColor: [
              '#4CAF50',
              '#F44336',
              '#2196F3',
              '#9E9E9E'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }
}

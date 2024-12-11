import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ActivatedRoute } from '@angular/router';
import * as Highcharts from 'highcharts';
import { MatTableDataSource } from '@angular/material/table';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { SharedService } from '../services/shared.service';

// Initialize Chart.js modules
Chart.register(...registerables, ChartDataLabels);

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

  // Data sources for tables
  plantToCompoundDataSource = new MatTableDataSource<PlantToCompoundData>([]);
  compoundToProteinDataSource = new MatTableDataSource<CompoundToProteinData>([]);
  proteinToDiseaseDataSource = new MatTableDataSource<ProteinToDiseaseData>([]);

  // Update methods for each table
  updatePlantToCompoundTable(data: any[]) {
    this.plantToCompoundDataSource.data = data.map(item => ({
      plantLatinName: item.pla_name,
      localPlantName: item.pla_idr_name || 'Unknown',
      compoundCAS: item.com_cas_id,
      compoundCommonName: 'Unknown', // Placeholder, modify as needed
      compoundIUPAC: 'Unknown', // Placeholder, modify as needed
      dataSource: 'Database', // Placeholder, modify as needed
      confidenceScore: 0 // Placeholder, modify as needed
    }));
  }

  updateCompoundToProteinTable(data: any[]) {
    this.compoundToProteinDataSource.data = data.map(item => ({
      compoundCAS: item.com_cas_id,
      compoundCommonName: 'Unknown', // Placeholder, modify as needed
      compoundIUPAC: 'Unknown', // Placeholder, modify as needed
      uniprotID: item.pro_uniprot_id,
      uniprotProteinName: item.pro_name,
      pdbIDs: item.pro_pdb_id || 'None',
      dataSource: item.source,
      confidenceScore: item.weight
    }));
  }

  updateProteinToDiseaseTable(data: any[]) {
    this.proteinToDiseaseDataSource.data = data.map(item => ({
      uniprotID: item.pro_uniprot_id,
      proteinName: item.pro_name,
      pdbIDs: item.pro_pdb_id || 'None',
      omimID: item.dis_omim_id,
      diseaseName: item.dis_name,
      dataSource: item.source,
      confidenceScore: item.weight
    }));
  }
  plantMetadataColumns: string[] = ['latinName', 'localName'];
  compoundMetadataColumns: string[] = ['casId', 'pubchemName', 'iupacName', 'knapsackId', 'keggId', 'pubchemId', 'drugbankId'];
  proteinMetadataColumns: string[] = ['casId', 'keggId', 'pubchemId', 'drugbankId'];
  diseaseMetadataColumns: string[] = ['omimId', 'diseaseName'];

  //change by aam to test
  /* 
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
  ]); */

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

  constructor(private route: ActivatedRoute, private sharedService: SharedService) {
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
    // Plant-to-Compound
  this.sharedService.plantToCompoundData$.subscribe((data) => {
    this.plantToCompoundDataSource.data = data.map((item) => ({
      plantLatinName: item.pla_name,
      localPlantName: item.pla_idr_name || 'Unknown',
      compoundCAS: item.com_cas_id,
      compoundCommonName: 'Unknown', // Jika data tersedia, ganti dengan item.property
      compoundIUPAC: 'Unknown', // Jika data tersedia, ganti dengan item.property
      dataSource: 'Database', // Jika data tersedia, ganti dengan item.property
      confidenceScore: 0, // Jika data tersedia, ganti dengan item.property
    }));
  });


  // Compound-to-Protein
  this.sharedService.compoundToProteinData$.subscribe((data) => {
    this.compoundToProteinDataSource.data = data.map((item) => ({
      compoundCAS: item.com_cas_id,
      compoundCommonName: 'Unknown',
      compoundIUPAC: 'Unknown',
      uniprotID: item.pro_uniprot_id,
      uniprotProteinName: item.pro_name,
      pdbIDs: item.pro_pdb_id || 'None',
      dataSource: item.source,
      confidenceScore: item.weight,
    }));
  });

  // Protein-to-Disease
  this.sharedService.proteinToDiseaseData$.subscribe((data) => {
    this.proteinToDiseaseDataSource.data = data.map((item) => ({
      uniprotID: item.pro_uniprot_id,
      proteinName: item.pro_name,
      pdbIDs: item.pro_pdb_id || 'None',
      omimID: item.dis_omim_id,
      diseaseName: item.dis_name,
      dataSource: item.source,
      confidenceScore: item.weight,
    }));
  });

  // Plant Metadata
  this.sharedService.plantToCompoundData$.subscribe((data) => {
    const plantMetadata = data.map((item) => ({
      latinName: item.pla_name,
      localName: item.pla_idr_name || 'Unknown',
    }));
    this.plantMetadataSource.data = plantMetadata;
  });

  // Compound Metadata
  this.sharedService.compoundToProteinData$.subscribe((compoundToProtein) => {
    const compoundMetadataFromProtein = compoundToProtein.map((item) => ({
      casId: item.com_cas_id || 'Unknown',
      pubchemName: 'Unknown', // Modify if data is available
      iupacName: 'Unknown', // Modify if data is available
      knapsackId: 'Unknown', // Modify if data is available
      keggId: 'Unknown', // Modify if data is available
      pubchemId: 'Unknown', // Modify if data is available
      drugbankId: 'Unknown', // Modify if data is available
    }));

    // Fallback to plantToCompoundData if compoundToProteinData is empty
    this.sharedService.plantToCompoundData$.subscribe((plantToCompound) => {
      const compoundMetadataFromPlant = plantToCompound.map((item) => ({
        casId: item.com_id || 'Unknown',
        pubchemName: 'Unknown', // Modify if data is available
        iupacName: 'Unknown', // Modify if data is available
        knapsackId: 'Unknown', // Modify if data is available
        keggId: 'Unknown', // Modify if data is available
        pubchemId: 'Unknown', // Modify if data is available
        drugbankId: 'Unknown', // Modify if data is available
      }));

      // Combine data from both sources, prioritizing compoundToProteinData
      this.compoundMetadataSource.data = [
        ...compoundMetadataFromProtein,
        ...compoundMetadataFromPlant.filter((item) =>
          !compoundMetadataFromProtein.some(
            (proteinItem) => proteinItem.casId === item.casId
          )
        ),
      ];
    });
  });

  // Protein Metadata
  this.sharedService.compoundToProteinData$.subscribe((compoundToProtein) => {
    const proteinMetadataFromCompound = compoundToProtein.map((item) => ({
      casId: item.pro_uniprot_id || 'Unknown',
      keggId: 'Unknown', // Modify if data is available
      pubchemId: 'Unknown', // Modify if data is available
      drugbankId: 'Unknown', // Modify if data is available
    }));

    // Fallback to proteinToDiseaseData if compoundToProtein is empty
    this.sharedService.proteinToDiseaseData$.subscribe((proteinToDisease) => {
      const proteinMetadataFromDisease = proteinToDisease.map((item) => ({
        casId: item.pro_uniprot_id || 'Unknown',
        keggId: 'Unknown', // Modify if data is available
        pubchemId: 'Unknown', // Modify if data is available
        drugbankId: 'Unknown', // Modify if data is available
      }));

      // Combine data from both sources, prioritizing compoundToProteinData
      this.proteinMetadataSource.data = [
        ...proteinMetadataFromCompound,
        ...proteinMetadataFromDisease.filter((item) =>
          !proteinMetadataFromCompound.some(
            (compoundItem) => compoundItem.casId === item.casId
          )
        ),
      ];
    });
  });

  // Disease Metadata
  this.sharedService.proteinToDiseaseData$.subscribe((data) => {
    const diseaseMetadata = data.map((item) => ({
      omimId: item.dis_omim_id,
      diseaseName: item.dis_name,
    }));
    this.diseaseMetadataSource.data = diseaseMetadata;
  });
    //change by aam to test
    /* this.route.queryParams.subscribe(params => {
      // Check which type was selected from home page
      const selectedType = params['type']?.toLowerCase();
      this.isPlantSelected = selectedType === 'plant';
      this.isCompoundSelected = selectedType === 'compound';
      this.isProteinSelected = selectedType === 'protein';
      this.isDiseaseSelected = selectedType === 'disease';
    }); */
  }

  private initializeCharts() {
    // Initialize Connectivity Pie Chart
    const connectivityCtx = document.getElementById('connectivityPieChart') as HTMLCanvasElement;
    if (connectivityCtx) {
      this.connectivityChart = new Chart(connectivityCtx, {
        type: 'pie',
        data: {
          datasets: [{
            backgroundColor: [
              getComputedStyle(document.documentElement).getPropertyValue("--secondary-400"),
              getComputedStyle(document.documentElement).getPropertyValue("--secondary-300"),
              getComputedStyle(document.documentElement).getPropertyValue("--secondary-200")
            ],
            data: [30, 45, 25],
            label: 'Dataset 1'
          }],
          labels: ['Plant-Compound', 'Compound-Protein', 'Protein-Disease']
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 80,
              right: 80,
              top: 40,
              bottom: 40
            }
          },
          plugins: {
            legend: {
              display: false
            },
            datalabels: {
              anchor: 'end',
              align: 'end',
              formatter: (value: number, ctx: any) => {
                const label = ctx.chart.data.labels[ctx.dataIndex] as string;
                const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(2);
                return `${label}\n${percentage}%`;
              },
              color: '#000',
              font: {
                size: 8,
                weight: 'bold'
              },
              textAlign: 'center'
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
          datasets: [{
            backgroundColor: [
              getComputedStyle(document.documentElement).getPropertyValue("--secondary-400"),
              getComputedStyle(document.documentElement).getPropertyValue("--secondary-300"),
              getComputedStyle(document.documentElement).getPropertyValue("--secondary-200"),
              getComputedStyle(document.documentElement).getPropertyValue("--neutral-300")
            ],
            data: [25, 35, 20, 20],
            label: 'Doughnut Dataset'
          }],
          labels: ['Known by Experiment', 'Known by Prediction', 'Unknown', 'Undefined']
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                boxWidth: 15,
                padding: 8,
                font: {
                  size: 10,
                  family: 'Arial, sans-serif',
                  style: 'normal',
                  lineHeight: 1.2
                },
                usePointStyle: true,
                pointStyle: 'rectRounded',
                generateLabels: (chart) => {
                  const labels = ['Known by Experiment', 'Known by Prediction', 'Unknown', 'Undefined'];
                  const backgroundColors = Array.isArray(chart.data.datasets[0].backgroundColor) ? chart.data.datasets[0].backgroundColor : [];
                  return labels.map((label, index) => ({
                    text: label,
                    fillStyle: backgroundColors[index] || '#000',
                    hidden: false,
                    lineCap: 'butt',
                    lineDash: [],
                    lineDashOffset: 0,
                    lineJoin: 'miter',
                    strokeStyle: 'transparent',
                    pointStyle: 'rectRounded',
                    rotation: 0
                  }));
                }
              }
            },
            datalabels: {
              anchor: 'end',
              align: 'end',
              formatter: (value: number, ctx: any) => {
                const label = ctx.chart.data.labels[ctx.dataIndex] as string;
                const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(2);
                return `${label}\n${percentage}%`;
              },
              color: '#000',
              font: {
                size: 8,
                weight: 'bold'
              },
              textAlign: 'center'
            }
          }
        }
      });
    }
  }
}

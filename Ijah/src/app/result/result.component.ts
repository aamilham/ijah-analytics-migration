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

// Register Chart.js plugins
Chart.register(...registerables, ChartDataLabels);

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

  plantToCompoundDataSource = new MatTableDataSource<PlantToCompoundData>([]);
  compoundToProteinDataSource = new MatTableDataSource<CompoundToProteinData>([]);
  proteinToDiseaseDataSource = new MatTableDataSource<ProteinToDiseaseData>([]);
  plantMetadataSource = new MatTableDataSource<PlantMetadata>([]);
  compoundMetadataSource = new MatTableDataSource<CompoundMetadata>([]);
  proteinMetadataSource = new MatTableDataSource<ProteinMetadata>([]);
  diseaseMetadataSource = new MatTableDataSource<DiseaseMetadata>([]);

  isPlantSelected: boolean = false;
  isCompoundSelected: boolean = false;
  isProteinSelected: boolean = false;
  isDiseaseSelected: boolean = false;

  searchResults: any = null;

  constructor(private route: ActivatedRoute) {
    this.loadSankeyModule().then(() => {
      this.initializeHighchartsOptions();
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
        data: []
      }]
    };
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const selectedType = params['type']?.toLowerCase();
      this.isPlantSelected = selectedType === 'plant';
      this.isCompoundSelected = selectedType === 'compound';
      this.isProteinSelected = selectedType === 'protein';
      this.isDiseaseSelected = selectedType === 'disease';
    });

    const resultsStr = sessionStorage.getItem('searchResults');
    if (resultsStr) {
      this.searchResults = JSON.parse(resultsStr);
    }

    this.updateTableData();
    this.updateSankeyData();
    this.initializeCharts();
  }

  private updateTableData() {
    if (this.searchResults) {
      if (this.searchResults.plantToCompoundConnections) {
        this.plantToCompoundDataSource.data = this.searchResults.plantToCompoundConnections;
      }

      if (this.searchResults.compoundToProteinConnections) {
        this.compoundToProteinDataSource.data = this.searchResults.compoundToProteinConnections;
      }

      if (this.searchResults.proteinToDiseaseConnections) {
        this.proteinToDiseaseDataSource.data = this.searchResults.proteinToDiseaseConnections;
      }

      if (this.searchResults.plantMetadata) {
        this.plantMetadataSource.data = this.searchResults.plantMetadata;
      }

      if (this.searchResults.compoundMetadata) {
        this.compoundMetadataSource.data = this.searchResults.compoundMetadata;
      }

      if (this.searchResults.proteinMetadata) {
        this.proteinMetadataSource.data = this.searchResults.proteinMetadata;
      }

      if (this.searchResults.diseaseMetadata) {
        this.diseaseMetadataSource.data = this.searchResults.diseaseMetadata;
      }
    }
  }

  private updateSankeyData() {
    if (this.searchResults && this.searchResults.sankeyLinks) {
      this.sankeyOptions = {
        ...this.sankeyOptions,
        series: [{
          type: 'sankey',
          name: 'Connectivity Flow',
          data: this.searchResults.sankeyLinks
        }]
      };
    }
  }

  private initializeCharts() {
    const connectivityCtx = document.getElementById('connectivityPieChart') as HTMLCanvasElement;
    if (connectivityCtx) {
      this.connectivityChart = new Chart(connectivityCtx, {
        type: 'pie',
        data: {
          datasets: [{
            backgroundColor: ['#4caf50', '#ffeb3b', '#2196f3'],
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
            } as any
          }
        } as any
      });
    }

    const statusCtx = document.getElementById('statusDoughnutChart') as HTMLCanvasElement;
    if (statusCtx) {
      this.statusChart = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          datasets: [{
            backgroundColor: ['#4caf50', '#ffeb3b', '#2196f3', '#9e9e9e'],
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
                generateLabels: (chart: any) => { // <-- Tambahkan tipe any pada parameter
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
                const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(2);
                return `${label}\n${percentage}%`;
              },
              color: '#000',
              font: {
                size: 8,
                weight: 'bold'
              },
              textAlign: 'center'
            } as any
          }
        } as any
      });
    }
  }
}

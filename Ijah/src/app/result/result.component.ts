import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { SharedService } from '../services/shared.service';
import { GoogleChartsService } from '../services/google-charts.service';

declare var google: {
  visualization: {
    DataTable: new () => any;
    Sankey: new (container: HTMLElement) => any;
    PieChart: new (container: HTMLElement) => any;
    events: {
      addListener: (chart: any, eventName: string, callback: (e?: any) => void) => void;
    };
  };
  charts: {
    load: (version: string, options: { packages: string[] }) => void;
    setOnLoadCallback: (callback: () => void) => void;
  };
};

// Interfaces for table data
interface PlantToCompoundData {
  plantLatinName?: string;
  plantCommonName?: string;
  compoundCommonName?: string;
  compoundId?: string;
  compoundCAS?: string;
  confidenceScore?: number;
  weight?: number;
}

interface CompoundToProteinData {
  compoundCommonName?: string;
  compoundId?: string;
  compoundCAS?: string;
  uniprotProteinName?: string;
  uniprotID?: string;
  confidenceScore?: number;
  weight?: number;
}

interface ProteinToDiseaseData {
  proteinName?: string;
  uniprotID?: string;
  diseaseName?: string;
  omimID?: string;
  confidenceScore?: number;
  weight?: number;
}

interface PlantMetadata {
  latinName?: string;
  localName?: string;
}

interface CompoundMetadata {
  casId?: string;
  pubchemName?: string;
  iupacName?: string;
  knapsackId?: string;
  keggId?: string;
  pubchemId?: string;
  drugbankId?: string;
}

interface ProteinMetadata {
  casId?: string;
  keggId?: string;
  pubchemId?: string;
  drugbankId?: string;
}

interface DiseaseMetadata {
  omimId?: string;
  diseaseName?: string;
}

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatTabsModule
  ]
})
export class ResultComponent implements OnInit, AfterViewInit {
  private chartInitialized = false;

  // Columns for tables
  plantToCompoundColumns: string[] = [
    'plantLatinName', 
    'plantCommonName', 
    'compoundCommonName', 
    'compoundId', 
    'compoundCAS', 
    'confidenceScore'
  ];

  compoundToProteinColumns: string[] = [
    'compoundCommonName', 
    'compoundId', 
    'compoundCAS', 
    'uniprotProteinName', 
    'uniprotID', 
    'confidenceScore'
  ];

  proteinToDiseaseColumns: string[] = [
    'proteinName', 
    'uniprotID', 
    'diseaseName', 
    'omimID', 
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
      plantCommonName: item.pla_idr_name || 'Unknown',
      compoundCommonName: item.com_name || 'Unknown',
      compoundId: item.com_id || 'Unknown',
      compoundCAS: item.com_cas_id,
      confidenceScore: item.weight || 0
    }));
  }

  updateCompoundToProteinTable(data: any[]) {
    this.compoundToProteinDataSource.data = data.map(item => ({
      compoundCommonName: item.com_name || 'Unknown',
      compoundId: item.com_id || 'Unknown',
      compoundCAS: item.com_cas_id,
      uniprotProteinName: item.pro_name,
      uniprotID: item.pro_uniprot_id,
      confidenceScore: item.weight || 0
    }));
  }

  updateProteinToDiseaseTable(data: any[]) {
    this.proteinToDiseaseDataSource.data = data.map(item => ({
      proteinName: item.pro_name,
      uniprotID: item.pro_uniprot_id,
      diseaseName: item.dis_name,
      omimID: item.dis_omim_id,
      confidenceScore: item.weight || 0
    }));
  }

  plantMetadataColumns: string[] = ['latinName', 'localName'];
  compoundMetadataColumns: string[] = ['casId', 'pubchemName', 'iupacName', 'knapsackId', 'keggId', 'pubchemId', 'drugbankId'];
  proteinMetadataColumns: string[] = ['casId', 'keggId', 'pubchemId', 'drugbankId'];
  diseaseMetadataColumns: string[] = ['omimId', 'diseaseName'];

  // Selected states
  isPlantSelected: boolean = false;
  isCompoundSelected: boolean = false;
  isProteinSelected: boolean = false;
  isDiseaseSelected: boolean = false;

  // Metadata sources
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

  // Count variables
  plantCount: number = 0;
  compoundCount: number = 0;
  proteinCount: number = 0;
  diseaseCount: number = 0;

  constructor(
    private route: ActivatedRoute, 
    private sharedService: SharedService,
    private googleChartsService: GoogleChartsService
  ) {
    // Subscribe to count updates
    this.sharedService.plantCount$.subscribe(count => this.plantCount = count);
    this.sharedService.compoundCount$.subscribe(count => this.compoundCount = count);
    this.sharedService.proteinCount$.subscribe(count => this.proteinCount = count);
    this.sharedService.diseaseCount$.subscribe(count => this.diseaseCount = count);
  }

  async ngAfterViewInit() {
    this.googleChartsService.waitForLoaded().then(() => {
      console.log('Google Charts loaded, drawing charts...');
      console.log('Plant to Compound data:', this.plantToCompoundDataSource.data);
      console.log('Compound to Protein data:', this.compoundToProteinDataSource.data);
      console.log('Protein to Disease data:', this.proteinToDiseaseDataSource.data);
      
      this.drawSankeyDiagram();
      this.drawConnectivityPieChart();
      this.drawStatusDoughnutChart();
    });
  }

  private drawSankeyDiagram() {
    if (typeof window.google === 'undefined' || !window.google?.visualization) {
      console.error('Google Visualization is not loaded');
      return;
    }

    const data = new window.google.visualization.DataTable();
    data.addColumn('string', 'From');
    data.addColumn('string', 'To');
    data.addColumn('number', 'Weight');

    // Create maps to store nodes by type
    const plantNodes = new Map<string, number>();
    const compoundNodes = new Map<string, number>();
    const proteinNodes = new Map<string, number>();
    const diseaseNodes = new Map<string, number>();
    
    // Function to format node names with proper spacing and line breaks
    const formatNodeName = (name: string): string => {
      // Remove type prefix temporarily
      const parts = name.split(': ');
      const type = parts[0];
      const label = parts[1];
      
      // Split long names into multiple lines
      const words = label.split(' ');
      let lines = [];
      let currentLine = '';
      
      // Adjust character limit based on node type
      const charLimit = type === 'Plant' ? 25 : 
                       type === 'Compound' ? 15 :
                       type === 'Protein' ? 15 : 12; // Shorter limits for Protein and Disease
      
      words.forEach(word => {
        if (currentLine.length + word.length > charLimit) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = currentLine ? `${currentLine} ${word}` : word;
        }
      });
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // Add type back with proper formatting
      return `${type}:\n${lines.join('\n')}`;
    };

    // Function to get node name with type prefix and ensure uniqueness
    const getNodeName = (type: string, name: string | undefined, fallbackId: string | undefined, nodeMap: Map<string, number>) => {
      const displayName = name || fallbackId || 'Unknown';
      // For compounds, use ID if available, otherwise use CAS ID
      if (type === 'Compound' && !name?.startsWith('Unknown')) {
        const nodeName = `${type}: ${displayName}`;
        if (!nodeMap.has(nodeName)) {
          nodeMap.set(nodeName, nodeMap.size);
        }
        return formatNodeName(nodeName);
      }
      const nodeName = `${type}: ${displayName}`;
      if (!nodeMap.has(nodeName)) {
        nodeMap.set(nodeName, nodeMap.size);
      }
      return formatNodeName(nodeName);
    };

    // First pass: collect all nodes by type
    this.plantToCompoundDataSource.data.forEach(item => {
      getNodeName('Plant', item.plantLatinName, item.plantCommonName, plantNodes);
      getNodeName('Compound', item.compoundId, item.compoundId, compoundNodes);
    });

    this.compoundToProteinDataSource.data.forEach(item => {
      getNodeName('Compound', item.compoundId, item.compoundId, compoundNodes);
      getNodeName('Protein', item.uniprotProteinName, item.uniprotID, proteinNodes);
    });

    this.proteinToDiseaseDataSource.data.forEach(item => {
      getNodeName('Protein', item.proteinName, item.uniprotID, proteinNodes);
      getNodeName('Disease', item.diseaseName, item.omimID, diseaseNodes);
    });

    const sankeyData: any[] = [];

    // Second pass: add connections while maintaining level order
    this.plantToCompoundDataSource.data.forEach(item => {
      const fromNode = getNodeName('Plant', item.plantLatinName, item.plantCommonName, plantNodes);
      const toNode = getNodeName('Compound', item.compoundId, item.compoundId, compoundNodes);
      
      sankeyData.push([
        fromNode,
        toNode,
        item.confidenceScore || item.weight || 1
      ]);
    });

    this.compoundToProteinDataSource.data.forEach(item => {
      const fromNode = getNodeName('Compound', item.compoundId, item.compoundId, compoundNodes);
      const toNode = getNodeName('Protein', item.uniprotProteinName, item.uniprotID, proteinNodes);
      
      sankeyData.push([
        fromNode,
        toNode,
        item.confidenceScore || item.weight || 1
      ]);
    });

    this.proteinToDiseaseDataSource.data.forEach(item => {
      const fromNode = getNodeName('Protein', item.proteinName, item.uniprotID, proteinNodes);
      const toNode = getNodeName('Disease', item.diseaseName, item.omimID, diseaseNodes);
      
      sankeyData.push([
        fromNode,
        toNode,
        item.confidenceScore || item.weight || 1
      ]);
    });

    data.addRows(sankeyData);

    const options = {
      width: '100%',
      height: 800,
      sankey: {
        node: {
          colors: [
            ...Array(plantNodes.size).fill('#4CAF50'),     // Green for Plants
            ...Array(compoundNodes.size).fill('#FFC107'),   // Yellow for Compounds
            ...Array(proteinNodes.size).fill('#2196F3'),    // Blue for Proteins
            ...Array(diseaseNodes.size).fill('#F44336')     // Red for Diseases
          ],
          label: {
            fontSize: 10,  // Smaller font size
            color: '#000',
            bold: true,
            padding: 14    // More padding
          },
          nodePadding: 100,    // Increased padding between nodes
          width: 30,           // Node width
          interactivity: true
        },
        link: {
          colorMode: 'gradient',
          fillOpacity: 0.5,
          color: {
            stroke: '#999',
            strokeWidth: 1
          }
        },
        iterations: 32,
        labelPadding: 14,      // Increased label padding
        nodeAlignment: 'LEFT',
        nodePaddingRatio: 0.95 // Increased ratio for more vertical space
      },
      tooltip: { 
        isHtml: true,
        textStyle: { fontSize: 12 }
      }
    };

    const container = document.getElementById('sankey_diagram');
    if (container) {
      try {
        const chart = new window.google.visualization.Sankey(container);
        
        // Add event listeners for interactivity
        google.visualization.events.addListener(chart, 'onmouseover', () => {
          if (container) container.style.cursor = 'pointer';
        });
        
        google.visualization.events.addListener(chart, 'onmouseout', () => {
          if (container) container.style.cursor = 'default';
        });

        chart.draw(data, options);

        // Make the chart responsive with minimum height
        const resizeChart = () => {
          const newHeight = Math.max(800, window.innerWidth * 0.6); 
          options.height = newHeight;
          chart.draw(data, options);
        };

        window.addEventListener('resize', resizeChart);
        
        console.log('Sankey diagram drawn successfully');
      } catch (error) {
        console.error('Error drawing Sankey diagram:', error);
      }
    } else {
      console.error('Sankey diagram container not found');
    }
  }

  private drawConnectivityPieChart() {
    if (typeof window.google === 'undefined' || !window.google?.visualization) return;

    const data = new window.google.visualization.DataTable();
    data.addColumn('string', 'Type');
    data.addColumn('number', 'Count');

    data.addRows([
      ['Plants', this.plantCount],
      ['Compounds', this.compoundCount],
      ['Proteins', this.proteinCount],
      ['Diseases', this.diseaseCount]
    ]);

    const options = {
      width: '100%',
      height: 300,
      colors: ['#4CAF50', '#FFC107', '#2196F3', '#F44336'],
      pieHole: 0,
      legend: { position: 'right' },
      pieSliceText: 'value',
      title: 'Connectivity Distribution'
    };

    const container = document.getElementById('connectivityPieChart');
    if (container) {
      const chart = new window.google.visualization.PieChart(container);
      chart.draw(data, options);
    }
  }

  private drawStatusDoughnutChart() {
    if (typeof window.google === 'undefined' || !window.google?.visualization) return;

    const data = new window.google.visualization.DataTable();
    data.addColumn('string', 'Status');
    data.addColumn('number', 'Count');

    // Calculate total connections
    const totalConnections = 
      this.plantToCompoundDataSource.data.length +
      this.compoundToProteinDataSource.data.length +
      this.proteinToDiseaseDataSource.data.length;

    data.addRows([
      ['Connected', totalConnections],
      ['Unconnected', this.plantCount + this.compoundCount + this.proteinCount + this.diseaseCount - totalConnections]
    ]);

    const options = {
      width: '100%',
      height: 300,
      pieHole: 0.4,
      colors: ['#4CAF50', '#FF5252'],
      legend: { position: 'right' },
      pieSliceText: 'value',
      title: 'Connection Status'
    };

    const container = document.getElementById('statusDoughnutChart');
    if (container) {
      const chart = new window.google.visualization.PieChart(container);
      chart.draw(data, options);
    }
  }

  ngOnInit() {
    // Subscribe to route params to get the data
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(params['data']);
          
          // Update counts from the data
          if (data.counts) {
            // Set local counts
            this.plantCount = data.counts.plants || 0;
            this.compoundCount = data.counts.compounds || 0;
            this.proteinCount = data.counts.proteins || 0;
            this.diseaseCount = data.counts.diseases || 0;
          }

          // Update selected states based on input types, not counts
          if (data.selectedTypes) {
            this.isPlantSelected = data.selectedTypes.plants;
            this.isCompoundSelected = data.selectedTypes.compounds;
            this.isProteinSelected = data.selectedTypes.proteins;
            this.isDiseaseSelected = data.selectedTypes.diseases;
          }
        } catch (error) {
          console.error('Error parsing data:', error);
        }
      }
    });

    // Subscribe to data updates
    this.sharedService.plantToCompoundData$.subscribe((data) => {
      console.log('Received plant to compound data:', data);
      if (!data) return;
      
      this.plantToCompoundDataSource.data = data.map((item) => ({
        plantLatinName: item.pla_name,
        plantCommonName: item.pla_idr_name || 'Unknown',
        compoundCommonName: item.com_name || 'Unknown',
        compoundId: item.com_id || 'Unknown',
        compoundCAS: item.com_cas_id,
        confidenceScore: item.weight || 0,
      }));
      this.updateCharts();
    });

    this.sharedService.compoundToProteinData$.subscribe((data) => {
      console.log('Received compound to protein data:', data);
      if (!data) return;
      
      this.compoundToProteinDataSource.data = data.map((item) => ({
        compoundCommonName: item.com_name || 'Unknown',
        compoundId: item.com_id || 'Unknown',
        compoundCAS: item.com_cas_id,
        uniprotProteinName: item.pro_name,
        uniprotID: item.pro_uniprot_id,
        confidenceScore: item.weight || 0,
      }));
      this.updateCharts();
    });

    this.sharedService.proteinToDiseaseData$.subscribe((data) => {
      console.log('Received protein to disease data:', data);
      if (!data) return;
      
      this.proteinToDiseaseDataSource.data = data.map((item) => ({
        proteinName: item.pro_name,
        uniprotID: item.pro_uniprot_id,
        diseaseName: item.dis_name,
        omimID: item.dis_omim_id,
        confidenceScore: item.weight || 0,
      }));
      this.updateCharts();
    });
  }

  private updateCharts() {
    // Only update charts if Google Charts is loaded
    this.googleChartsService.isLoaded$.subscribe(isLoaded => {
      if (isLoaded) {
        console.log('Updating charts with new data');
        this.drawSankeyDiagram();
        this.drawConnectivityPieChart();
        this.drawStatusDoughnutChart();
      }
    });
  }
}

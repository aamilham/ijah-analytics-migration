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
  pla_id?: string;
  pla_name?: string;
  pla_idr_name?: string;
  pla_description?: string;
}

interface CompoundMetadata {
  com_id?: string;
  com_cas_id?: string;
  com_drugbank_id?: string;
  com_knapsack_id?: string;
  com_kegg_id?: string;
  com_pubchem_id?: string;
  com_inchikey?: string;
  com_smiles?: string;
  com_name?: string;
}

interface ProteinMetadata {
  pro_id?: string;
  pro_uniprot_id?: string;
  pro_name?: string;
  pro_description?: string;
}

interface DiseaseMetadata {
  dis_id?: string;
  dis_omim_id?: string;
  dis_name?: string;
  dis_description?: string;
}

interface SankeyNode {
  name: string;
  label: string;
  commonName?: string;
  description?: string;
  casId?: string;
  drugbankId?: string;
  knapsackId?: string;
  keggId?: string;
  pubchemId?: string;
  inchikey?: string;
  smiles?: string;
  uniprotId?: string;
  omimId?: string;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: any[];
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
    'compoundId',
    'compoundCommonName',
    'compoundCAS',
    'confidenceScore'
  ];

  compoundToProteinColumns: string[] = [
    'compoundId',
    'compoundCommonName',
    'compoundCAS',
    'uniprotID',
    'uniprotProteinName',
    'confidenceScore'
  ];

  proteinToDiseaseColumns: string[] = [
    'uniprotID',
    'proteinName',
    'omimID',
    'diseaseName',
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
      compoundId: item.com_id,
      compoundCommonName: item.com_name || 'Unknown',
      compoundCAS: item.com_cas_id,
      confidenceScore: item.weight || 0
    }));
  }

  updateCompoundToProteinTable(data: any[]) {
    this.compoundToProteinDataSource.data = data.map(item => ({
      compoundId: item.com_id,
      compoundCommonName: item.com_name || 'Unknown',
      compoundCAS: item.com_cas_id,
      uniprotID: item.pro_uniprot_id,
      uniprotProteinName: item.pro_name,
      confidenceScore: item.weight || 0
    }));
  }

  updateProteinToDiseaseTable(data: any[]) {
    this.proteinToDiseaseDataSource.data = data.map(item => ({
      uniprotID: item.pro_uniprot_id,
      proteinName: item.pro_name,
      omimID: item.dis_omim_id,
      diseaseName: item.dis_name,
      confidenceScore: item.weight || 0
    }));
  }

  // Metadata table columns
  plantMetadataColumns: string[] = [
    'pla_id',
    'pla_name',
    'pla_idr_name',
    'pla_description'
  ];

  compoundMetadataColumns: string[] = [
    'com_id',
    'com_cas_id',
    'com_drugbank_id',
    'com_knapsack_id',
    'com_kegg_id',
    'com_pubchem_id',
    'com_inchikey',
    'com_smiles',
    'com_name'
  ];

  proteinMetadataColumns: string[] = [
    'pro_id',
    'pro_uniprot_id',
    'pro_name',
    'pro_description'
  ];

  diseaseMetadataColumns: string[] = [
    'dis_id',
    'dis_omim_id',
    'dis_name',
    'dis_description'
  ];

  // Selected states and data
  selectedPlant: any = null;
  selectedCompound: any = null;
  selectedProtein: any = null;
  selectedDisease: any = null;

  // Metadata sources
  plantMetadataSource = new MatTableDataSource<PlantMetadata>([]);
  compoundMetadataSource = new MatTableDataSource<CompoundMetadata>([]);
  proteinMetadataSource = new MatTableDataSource<ProteinMetadata>([]);
  diseaseMetadataSource = new MatTableDataSource<DiseaseMetadata>([]);

  onNodeClick(event: any) {
    const node = event.target;
    if (!node || !node.name) return;

    const nodeType = node.name.split('_')[0];
    const nodeData = this.getNodeData(node);

    // Reset all selections
    this.selectedPlant = null;
    this.selectedCompound = null;
    this.selectedProtein = null;
    this.selectedDisease = null;

    // Update selected item and metadata based on node type
    switch (nodeType) {
      case 'plant':
        this.selectedPlant = nodeData;
        this.updatePlantMetadata(nodeData);
        this.isPlantSelected = true;
        this.isCompoundSelected = false;
        this.isProteinSelected = false;
        this.isDiseaseSelected = false;
        break;
      case 'compound':
        this.selectedCompound = nodeData;
        this.updateCompoundMetadata(nodeData);
        this.isPlantSelected = false;
        this.isCompoundSelected = true;
        this.isProteinSelected = false;
        this.isDiseaseSelected = false;
        break;
      case 'protein':
        this.selectedProtein = nodeData;
        this.updateProteinMetadata(nodeData);
        this.isPlantSelected = false;
        this.isCompoundSelected = false;
        this.isProteinSelected = true;
        this.isDiseaseSelected = false;
        break;
      case 'disease':
        this.selectedDisease = nodeData;
        this.updateDiseaseMetadata(nodeData);
        this.isPlantSelected = false;
        this.isCompoundSelected = false;
        this.isProteinSelected = false;
        this.isDiseaseSelected = true;
        break;
    }
  }

  private getNodeData(node: any): any {
    if (!node || !node.name) return null;

    // Extract node data based on the node type
    const [nodeType, nodeId] = node.name.split('_');
    
    // Find the corresponding data from our data arrays
    switch (nodeType) {
      case 'plant':
        return this.plantData.find(p => p.pla_id === nodeId) || {
          pla_id: nodeId,
          pla_name: node.label || 'Unknown',
          pla_idr_name: 'N/A',
          pla_description: 'No description available'
        };
      case 'compound':
        return this.compoundData.find(c => c.com_id === nodeId) || {
          com_id: nodeId,
          com_cas_id: node.casId || 'N/A',
          com_drugbank_id: node.drugbankId || 'N/A',
          com_knapsack_id: node.knapsackId || 'N/A',
          com_kegg_id: node.keggId || 'N/A',
          com_pubchem_id: node.pubchemId || 'N/A',
          com_inchikey: node.inchikey || 'N/A',
          com_smiles: node.smiles || 'N/A',
          com_name: node.label || 'Unknown'
        };
      case 'protein':
        return this.proteinData.find(p => p.pro_id === nodeId) || {
          pro_id: nodeId,
          pro_uniprot_id: node.uniprotId || 'N/A',
          pro_name: node.label || 'Unknown',
          pro_description: 'No description available'
        };
      case 'disease':
        return this.diseaseData.find(d => d.dis_id === nodeId) || {
          dis_id: nodeId,
          dis_omim_id: node.omimId || 'N/A',
          dis_name: node.label || 'Unknown',
          dis_description: 'No description available'
        };
      default:
        return null;
    }
  }

  private updatePlantMetadata(plant: PlantMetadata | null) {
    if (plant) {
      this.plantMetadataSource.data = [plant];
    } else {
      this.plantMetadataSource.data = [];
    }
  }

  private updateCompoundMetadata(compound: CompoundMetadata | null) {
    if (compound) {
      this.compoundMetadataSource.data = [compound];
    } else {
      this.compoundMetadataSource.data = [];
    }
  }

  private updateProteinMetadata(protein: ProteinMetadata | null) {
    if (protein) {
      this.proteinMetadataSource.data = [protein];
    } else {
      this.proteinMetadataSource.data = [];
    }
  }

  private updateDiseaseMetadata(disease: DiseaseMetadata | null) {
    if (disease) {
      this.diseaseMetadataSource.data = [disease];
    } else {
      this.diseaseMetadataSource.data = [];
    }
  }

  // Is selected states
  isPlantSelected: boolean = false;
  isCompoundSelected: boolean = false;
  isProteinSelected: boolean = false;
  isDiseaseSelected: boolean = false;

  // Count variables
  plantCount: number = 0;
  compoundCount: number = 0;
  proteinCount: number = 0;
  diseaseCount: number = 0;

  // Sankey data
  sankeyData: SankeyData = {
    nodes: [],
    links: []
  };

  // Data arrays with proper typing
  plantData: PlantMetadata[] = [];
  compoundData: CompoundMetadata[] = [];
  proteinData: ProteinMetadata[] = [];
  diseaseData: DiseaseMetadata[] = [];

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
    // Initialize data when component loads
    this.initializeData();
    
    // Initialize empty metadata tables
    this.plantMetadataSource.data = [];
    this.compoundMetadataSource.data = [];
    this.proteinMetadataSource.data = [];
    this.diseaseMetadataSource.data = [];

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
        compoundId: item.com_id,
        compoundCommonName: item.com_name || 'Unknown',
        compoundCAS: item.com_cas_id,
        confidenceScore: item.weight || 0,
      }));
      this.updateCharts();
    });

    this.sharedService.compoundToProteinData$.subscribe((data) => {
      console.log('Received compound to protein data:', data);
      if (!data) return;
      
      this.compoundToProteinDataSource.data = data.map((item) => ({
        compoundId: item.com_id,
        compoundCommonName: item.com_name || 'Unknown',
        compoundCAS: item.com_cas_id,
        uniprotID: item.pro_uniprot_id,
        uniprotProteinName: item.pro_name,
        confidenceScore: item.weight || 0,
      }));
      this.updateCharts();
    });

    this.sharedService.proteinToDiseaseData$.subscribe((data) => {
      console.log('Received protein to disease data:', data);
      if (!data) return;
      
      this.proteinToDiseaseDataSource.data = data.map((item) => ({
        uniprotID: item.pro_uniprot_id,
        proteinName: item.pro_name,
        omimID: item.dis_omim_id,
        diseaseName: item.dis_name,
        confidenceScore: item.weight || 0,
      }));
      this.updateCharts();
    });
  }

  private initializeData(): void {
    if (!this.sankeyData || !this.sankeyData.nodes) {
      console.warn('Sankey data not initialized');
      return;
    }

    // Convert Sankey data to our metadata format
    this.plantData = this.sankeyData.nodes
      .filter((node: SankeyNode) => node.name.startsWith('plant_'))
      .map((node: SankeyNode) => ({
        pla_id: node.name.split('_')[1],
        pla_name: node.label,
        pla_idr_name: node.commonName || 'N/A',
        pla_description: node.description || 'No description available'
      }));

    this.compoundData = this.sankeyData.nodes
      .filter((node: SankeyNode) => node.name.startsWith('compound_'))
      .map((node: SankeyNode) => ({
        com_id: node.name.split('_')[1],
        com_cas_id: node.casId || 'N/A',
        com_drugbank_id: node.drugbankId || 'N/A',
        com_knapsack_id: node.knapsackId || 'N/A',
        com_kegg_id: node.keggId || 'N/A',
        com_pubchem_id: node.pubchemId || 'N/A',
        com_inchikey: node.inchikey || 'N/A',
        com_smiles: node.smiles || 'N/A',
        com_name: node.label
      }));

    this.proteinData = this.sankeyData.nodes
      .filter((node: SankeyNode) => node.name.startsWith('protein_'))
      .map((node: SankeyNode) => ({
        pro_id: node.name.split('_')[1],
        pro_uniprot_id: node.uniprotId || 'N/A',
        pro_name: node.label,
        pro_description: node.description || 'No description available'
      }));

    this.diseaseData = this.sankeyData.nodes
      .filter((node: SankeyNode) => node.name.startsWith('disease_'))
      .map((node: SankeyNode) => ({
        dis_id: node.name.split('_')[1],
        dis_omim_id: node.omimId || 'N/A',
        dis_name: node.label,
        dis_description: node.description || 'No description available'
      }));
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

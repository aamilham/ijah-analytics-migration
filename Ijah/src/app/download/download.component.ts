import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css'],
  standalone: true, // Mark this as a standalone component
  imports: [CommonModule, FormsModule], // Import FormsModule and CommonModule
})
export class DownloadComponent {
  files = [
    {
      name: 'Plants_Database.csv',
      size: '2.3 MB',
      date: 'April 21, 2024',
      link: 'downloads/Plants_Database.csv',
    },
    {
      name: 'Compounds_Database.csv',
      size: '1.7 MB',
      date: 'April 19, 2024',
      link: 'downloads/Compounds_Database.csv',
    },
    {
      name: 'Diseases_Database.csv',
      size: '3.1 MB',
      date: 'April 18, 2024',
      link: 'downloads/Diseases_Database.csv',
    },
  ];

  filteredFiles = [...this.files];

  constructor() {}

  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredFiles = this.files.filter((file) =>
      file.name.toLowerCase().includes(searchTerm)
    );
  }
}

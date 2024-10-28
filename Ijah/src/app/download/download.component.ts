import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css'],
})
export class DownloadComponent implements OnInit {
  // Files array with dummy data for front-end display
  files = [
    {
      name: 'Plants_Database.csv',
      size: '2.3 MB',
      date: 'April 21, 2024',
      link: '#',
    },
    {
      name: 'Compounds_Database.csv',
      size: '1.7 MB',
      date: 'April 19, 2024',
      link: '#',
    },
    {
      name: 'Diseases_Database.csv',
      size: '3.1 MB',
      date: 'April 18, 2024',
      link: '#',
    },
  ];

  // Filtered list of files to match the search
  filteredFiles = [...this.files];

  constructor() {}

  ngOnInit(): void {}

  // Function to filter files based on search input
  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredFiles = this.files.filter((file) =>
      file.name.toLowerCase().includes(searchTerm)
    );
  }
}

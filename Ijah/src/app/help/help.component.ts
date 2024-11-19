import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class HelpComponent {
  faqs: { question: string; answer: string[]; isList: boolean }[] = [
    {
      question: 'What is Ijah used for?',
      answer: [
        'Explore connectivity from plants to compounds, proteins, and diseases.',
        'Identify targeted proteins/diseases from specific plants/compounds.',
        'Find plants/compounds that could cure certain proteins/diseases.',
        'Validate Jamu formulas and their potential efficacy.',
      ],
      isList: true,
    },
    {
      question: 'How can we download all data available in Ijah?',
      answer: ['Please go to our Downloads menu.'],
      isList: false,
    },
    {
      question: 'Where can I see the IJAH Analytics usage manual?',
      answer: [
        'You can find it in the Downloads menu under the Documents section.',
      ],
      isList: false,
    },
    {
      question: 'How can we report an issue?',
      answer: [
        'You can report issues via the Contact menu or open an issue in our public repository.',
      ],
      isList: false,
    },
    {
      question: 'How to open .csv files? Which application should be used?',
      answer: [
        'Use standard text editors like WordPad or Notepad++.',
        'Open in MS Excel with "comma" as the delimiter.',
        'When using MS Excel, set file types to "All Files" in the "File -> Open" menu.',
      ],
      isList: true,
    },
    {
      question: 'Is there any related links pertaining to Indonesia Jamu?',
      answer: [
        'http://jamu.or.id/',
        'http://jamu.ipb.ac.id/',
        'http://www.iherb.org/',
        'http://www.herbs.org/',
        'http://www.herbsociety.org/',
      ],
      isList: true,
    },
    {
      question:
        'Recommended links for further description about Indonesia plants?',
      answer: [
        'Good references for Indonesian plants include Herbalis Nusantara.',
      ],
      isList: true,
    },
    {
      question: 'Is there any disclaimer for IJAH Analytics?',
      answer: [
        'IJAH Analytics is provided free-of-charge with no warranties regarding the accuracy of the information provided. We are not liable for any damages resulting from its use.',
      ],
      isList: false,
    },
  ];

  expanded: boolean[] = this.faqs.map(() => false);

  toggleCollapse(index: number): void {
    this.expanded[index] = !this.expanded[index];
  }
}

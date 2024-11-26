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
  faqs = [
    {
      question: 'What is Ijah used for',
      answer: [
        '1) given plants/compounds and proteins/diseases, you want to know the connectivity from plants to compounds to proteins to diseases',
        '2) given plants/compounds, you want to know targeted proteins/diseases',
        '3) given proteins/diseases, you want to know plants/compounds that target (poteintially) cure such proteins/diseases',
        '4) validating/cross-checking whether some plant compositions, i.e. Jamu formulas, have certain efficacy'
      ],
      isList: true
    },
    {
      question: 'How can we download all data available in Ijah?',
      answer: ['Please go to our <a href="/downloads" target="_blank">Downloads</a> menu.'],
      isList: false
    },
    {
      question: 'Where can i see the Ijah Webserver usage manual?',
      answer: ['Please go to our <a href="/downloads" target="_blank">Downloads</a> menu, see <b>Documents</b> section.'],
      isList: false
    },
    {
      question: 'How can we report an issue?',
      answer: ['The best way is to file any issue via <a href="/contact" target="_blank">Contact</a> menu. You can also open an issue in <a href="https://github.com/tttor/csipb-jamu-prj/issues" target="_blank">our public repository</a>.'],
      isList: false
    },
    {
      question: 'How can we get the SQL dump of Ijah database?',
      answer: ['Please <a href="/about" target="_blank">contact us</a>.'],
      isList: false
    },
    {
      question: 'Is the source code of Ijah Webserver publicly availaible?',
      answer: ['Yes, please see our public repository <a href="https://github.com/tttor/csipb-jamu-prj" target="_blank">here</a>.'],
      isList: false
    },
    {
      question: 'How to cite the work of Ijah Webserver?',
      answer: ['In the meantime, please use <a href="http://ijah.apps.cs.ipb.ac.id/api/ijah_webserver_online.bib" target="_blank">ijah_webserver_online.bib</a>'],
      isList: false
    },
    {
      question: 'How many visitors have visited this Ijah Webserver?',
      answer: ['Please see the visitor log on the bottom-right of this page. The log has been running since January 13th, 2017, 6:00 PM (GMT+7:00). For the detailed statistics, please click inside the log area.'],
      isList: false
    },
    {
      question: 'Is there any online forum for Ijah users?',
      answer: ['Yes, please join us at ijah-users@googlegroups.com.'],
      isList: false
    },
    {
      question: 'How to open .csv files? Which application should be used?',
      answer: ['You can open .csv files using standard text editor, such as WordPad, Notepad++. You can also open them using Ms Excel with "comma" as the delimiter. When opening using MS Excel via "File -> Open", please make sure that you set the file types (to show/open) to "All Files".'],
      isList: false
    },
    {
      question: 'Is there any related links pertaining to Indonesia Jamu?',
      answer: [
        '<a href="http://jamu.or.id/" target="_blank">http://jamu.or.id/</a>',
        '<a href="http://jamu.ipb.ac.id/" target="_blank">http://jamu.ipb.ac.id/</a>',
        '<a href="http://www.iherb.org/" target="_blank">http://www.iherb.org/</a>',
        '<a href="http://www.herbs.org/" target="_blank">http://www.herbs.org/</a>',
        '<a href="http://www.herbsociety.org/" target="_blank">http://www.herbsociety.org/</a>'
      ],
      isList: true
    },
    {
      question: 'Recommended links for further description about Indonesia plants?',
      answer: ['Good references for Indonesian plants include: <a href="http://www.herbalisnusantara.com/obatherbal/" target="_blank">herbalisnusantara</a>.'],
      isList: false
    },
    {
      question: 'Our question is not in the list, where should we ask?',
      answer: ['Please <a href="/contact" target="_blank">contact us</a>.'],
      isList: false
    },
    {
      question: 'Is there any disclaimer for Ijah Webserver?',
      answer: ['Yes. Ijah Webserver is provided free-of-charge in the hope that it will be useful. We make no representation or warranty regarding results obtained from using any information provided through this server. We bear no responsibility for any incidental or consequential damages or direct or indirect damages that result from the use of results, data or information, which have been provided through this server.'],
      isList: false
    }
  ];

  expanded: boolean[] = new Array(this.faqs.length).fill(false);

  toggleCollapse(index: number): void {
    // Close all other items
    this.expanded = this.expanded.map((_, i) => i === index ? !this.expanded[index] : false);
  }
}

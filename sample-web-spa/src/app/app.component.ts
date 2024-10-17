import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChatbotComponent } from './chatbot/chatbot.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
    RouterModule,
    MatSidenavModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatToolbarModule,
    OverlayModule,
    HttpClientModule,
    ChatbotComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'sample-ng-spa';
  opened : boolean = true;
  isOpen: boolean = false;
  isAgentOpen: boolean = false;
  isLocalAgentOpen: boolean = false;
  serachInput: string = '';
  searchResultsLoading: boolean = true;
  serachResults: any = [];
  menuItems: Array<any> = [
    {label: 'Home', value: 'home'},
    {label: 'Positions', value: 'positions'},
    {label: 'Balances', value: 'balances'}
  ];

  constructor(private httpClient: HttpClient, private router: Router) {}

  toggleOverlay() {
    this.isOpen = !this.isOpen;
  }
  toggleAgentOverlay() {
    this.isAgentOpen = !this.isAgentOpen;
  }

  searchClick() {
    this.serachResults = [];
    this.searchResultsLoading = true;
    if (!this.isOpen) {
      this.isOpen = true;
    }
    setTimeout(() => {
      this.getSemanticSearchResults();
      this.searchResultsLoading = false;
    }, 200);
  }

  onActionLinkClick(link: string) {
    this.router.navigateByUrl(link.replace(/.*\/\/[^\/]*/, ''));

    //replace(/^https?:\/\//,"")
  }

  private getSemanticSearchResults() : void {
    this.httpClient.post('http://localhost:8000/simiariy_search', {
        "data": this.serachInput
    }).subscribe((response: any) => {
      this.serachResults = response.map((val: any) => {
        val = val[0];
        if (val.page_content !== 'SampleNgSpa') {
          if (val.page_content.startsWith('http://')) {
            return { data: val.page_content, actionLink: true };
          } else {
            return { data: val.page_content, actionLink: false };
          }
        } else {
          return null;
        }
      });
      this.serachResults = this.serachResults.filter((elm: any) => { return elm !== null;});
      if (this.serachResults.length === 0) {
        this.serachResults.push({data: "No results found"});
      }
    });
  }
}

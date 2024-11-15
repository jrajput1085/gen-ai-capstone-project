import { Component } from '@angular/core';
import { NavigationEnd, NavigationStart, RouterModule, RouterOutlet } from '@angular/router';
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
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppService } from './app.service';

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
    ChatbotComponent,
    MenubarModule,
    MatProgressSpinnerModule
  ],
  providers:[
    AppService
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
    {label: 'Bookmarks', value: ''},
    {label: 'Recent Entities', value: ''},
    {label: 'Browse', value: ''}
  ];
  horizontalMenuItems: MenuItem[] | undefined;

  constructor(private httpClient: HttpClient, private router: Router, public appService: AppService) {
    this.horizontalMenuItems = [
      {
          label: 'Home',
          icon: 'pi pi-home',
          command: () => {
            this.router.navigate(["/home"]);
          }
      },
      {
          label: 'Positions',
          icon: 'pi pi-box',
          command: () => {
            this.router.navigate(["/positions"]);
          }
      },
      {
          label: 'Balances',
          icon: 'pi pi-box',
          command: () => {
            this.router.navigate(["/balances"]);
          }
      },
      {
          label: 'Account Views',
          icon: 'pi pi-box',
          items: [
              {
                  label: 'Account Overview',
                  icon: 'pi pi-box',
                  command: () => {
                    this.router.navigate(["/account-overview"]);
                  }
              }
          ]
      },
      {
          label: 'Client Views',
          icon: 'pi pi-box',
          items: [
              {
                  label: 'Client Overview',
                  icon: 'pi pi-box',
                  command: () => {
                    this.router.navigate(["/client-overview"]);
                  }
              },
              {
                  label: 'Client Accounts',
                  icon: 'pi pi-box',
                  command: () => {
                    this.router.navigate(["/client-accounts"]);
                  }
              }
          ]
      },
      {
          label: 'Trading',
          icon: 'pi pi-box',
          items: [
              {
                  label: 'Equity',
                  icon: 'pi pi-box',
                  command: () => {
                    this.router.navigate(["/trade-equity"]);
                  }
              },
              {
                  label: 'Fixed Income',
                  icon: 'pi pi-box',
                  command: () => {
                    this.router.navigate(["/trade-fixed-income"]);
                  }
              },
              {
                  label: 'Options',
                  icon: 'pi pi-box',
                  command: () => {
                    this.router.navigate(["/trade-option"]);
                  }
              }
          ]
      },
      {
          label: 'Research',
          icon: 'pi pi-box',
          items: [
              {
                  label: 'Marketing Overview',
                  icon: 'pi pi-box',
                  command: () => {
                    this.router.navigate(["/research-marketing-overview"]);
                  }
              }
          ]
      }
    ]
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.appService.loading = true;
      }

      if (event instanceof NavigationEnd) {
        setTimeout(()=>{
          this.appService.loading = false;
        }, 1000);
      }
    });
  }

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

// Market Overview Component: Shows indices, sector performance, and economic data.import { Component } from '@angular/core';
import { Component } from '@angular/core';
import { AppService } from '../../app.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'market-overview',
    standalone: true,
    imports: [ CommonModule ],
    templateUrl: './market-overview.component.html',
    styleUrl: './market-overview.component.less'
  })
  export class MarketOverviewComponent {
    constructor(public appService: AppService) {
    }
  }
  
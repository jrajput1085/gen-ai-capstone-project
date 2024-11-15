// Equity Component: Manages stock trading, order entry, and execution reports.


import { Component } from '@angular/core';
import { AppService } from '../../app.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'equity',
    standalone: true,
    imports: [ CommonModule ],
    templateUrl: './equity.component.html',
    styleUrl: './equity.component.less'
  })
  export class EquityTradingComponent {
    constructor(public appService: AppService) {
    }
  }
// Fixed Income Component: Facilitates bond trading and yield curve analysis.
import { Component } from '@angular/core';
import { AppService } from '../../app.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'fixed-income',
    standalone: true,
    imports: [ CommonModule ],
    templateUrl: './fixed-income.component.html',
    styleUrl: './fixed-income.component.less'
  })
  export class FixedIncomeTradingComponent {
    constructor(public appService: AppService) {
    }
  }
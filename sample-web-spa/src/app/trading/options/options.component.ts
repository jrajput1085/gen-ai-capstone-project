// Options Component: Provides options chain, strategy builder, and order tracking.


import { Component } from '@angular/core';
import { AppService } from '../../app.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'fixed-income',
    standalone: true,
    imports: [ CommonModule ],
    templateUrl: './options.component.html',
    styleUrl: './options.component.less'
  })
  export class OptionsTradingComponent {
    constructor(public appService: AppService) {
    }
  }
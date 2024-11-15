// Account Overview Component: Provides balance, asset allocation, and transaction history.import { Component } from '@angular/core';
import { Component } from '@angular/core';
import { AppService } from '../../app.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'account-overview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './account-overview.component.html',
    styleUrl: './account-overview.component.less'
  })
  export class AccountOverviewComponent {
    constructor(public appService: AppService) {
    }
  }
// Client Accounts Component: Lists and manages client accounts and holdings.import { Component } from '@angular/core';
import { Component } from '@angular/core';
import { AppService } from '../../app.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'client-accounts',
    standalone: true,
    imports: [ CommonModule],
    templateUrl: './client-accounts.component.html',
    styleUrl: './client-accounts.component.less'
  })
  export class ClientAccountsComponent {
    constructor(public appService: AppService) {
    }
  }
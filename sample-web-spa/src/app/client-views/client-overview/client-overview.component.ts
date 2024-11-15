// Client Overview Component: Shows client summary, profile, and goals.import { Component } from '@angular/core';
import { Component } from '@angular/core';
import { AppService } from '../../app.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'client-overview',
    standalone: true,
    imports: [ CommonModule ],
    templateUrl: './client-overview.component.html',
    styleUrl: './client-overview.component.less'
  })
  export class ClientOverviewComponent {
    constructor(public appService: AppService) {
    }
  }
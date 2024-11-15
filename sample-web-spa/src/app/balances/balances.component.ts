import { Component } from '@angular/core';
import { AppService } from '../app.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-balances',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './balances.component.html',
  styleUrl: './balances.component.less'
})
export class BalancesComponent {
  constructor(public appService: AppService) {
  }
}

import { Component } from '@angular/core';
import { AppService } from '../app.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-positions',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './positions.component.html',
  styleUrl: './positions.component.less'
})
export class PositionsComponent {
  constructor(public appService: AppService) {
  }
}

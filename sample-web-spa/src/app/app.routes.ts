import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PositionsComponent } from './positions/positions.component';
import { BalancesComponent } from './balances/balances.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'positions', component: PositionsComponent },
    { path: 'balances', component: BalancesComponent }
];

import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PositionsComponent } from './positions/positions.component';
import { BalancesComponent } from './balances/balances.component';
import { AccountOverviewComponent } from './account-views/account-overview/account-overview.component';
import { ClientOverviewComponent } from './client-views/client-overview/client-overview.component';
import { ClientAccountsComponent } from './client-views/client-accounts/client-accounts.component';
import { EquityTradingComponent } from './trading/equity/equity.component';
import { FixedIncomeTradingComponent } from './trading/fixed-income/fixed-income.component';
import { OptionsTradingComponent } from './trading/options/options.component';
import { MarketOverviewComponent } from './research/market-overview/market-overview.component';

export const routes: Routes = [
    { path:'', component: HomeComponent},
    { path: 'home', component: HomeComponent },
    { path: 'positions', component: PositionsComponent },
    { path: 'balances', component: BalancesComponent },
    { path: 'account-overview', component: AccountOverviewComponent },
    { path: 'client-overview', component: ClientOverviewComponent },
    { path: 'client-accounts', component: ClientAccountsComponent },
    { path: 'trade-equity', component: EquityTradingComponent },
    { path: 'trade-fixed-income', component: FixedIncomeTradingComponent },
    { path: 'trade-option', component: OptionsTradingComponent },
    { path: 'research-marketing-overview', component: MarketOverviewComponent }
];

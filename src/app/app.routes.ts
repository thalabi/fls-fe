import { Routes } from '@angular/router';
import { PrimengTestComponent } from './primeng-test/primeng-test.component';
import { LogSheetComponent } from './log-sheet/log-sheet.component';
import { AcParametersComponent } from './ac-parameters/ac-parameters.component';
import { RefuelComponent } from './fuel-log/refuel/refuel.component';
import { AuthGuard } from './auth/auth-guard.service';
import { WelcomeComponent } from './welcome/welcome.component';
import { Httpstatus404Component } from './httpstatus404/httpstatus404.component';
import { FuelLogMaintenaceComponent } from './fuel-log/maintenance/fuel-log-maintenance.component';

export const routes: Routes = [
    { path: 'welcome', component: WelcomeComponent },
    { path: 'test', component: PrimengTestComponent },
    { path: 'log-sheet', component: LogSheetComponent, canActivate: [AuthGuard] },
    { path: 'refuel', component: RefuelComponent, canActivate: [AuthGuard] },
    { path: 'ac-parameters', component: AcParametersComponent, canActivate: [AuthGuard] },
    { path: 'fuel-log', component: FuelLogMaintenaceComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    { path: '**', component: Httpstatus404Component },

];

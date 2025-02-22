import { Routes } from '@angular/router';
import { PrimengTestComponent } from './primeng-test/primeng-test.component';
import { LogSheetComponent } from './log-sheet/log-sheet.component';
import { AircraftParametersComponent } from './aircraft-parameters/aircraft-parameters.component';
import { AuthGuard } from './auth/auth-guard.service';
import { WelcomeComponent } from './welcome/welcome.component';
import { Httpstatus404Component } from './httpstatus404/httpstatus404.component';

export const routes: Routes = [
    { path: 'welcome', component: WelcomeComponent },
    { path: '', redirectTo: 'log-sheet', pathMatch: 'full' },
    { path: 'test', component: PrimengTestComponent },
    { path: 'log-sheet', component: LogSheetComponent, canActivate: [AuthGuard] },
    { path: 'ac-parameters', component: AircraftParametersComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    //{ path: 'login', component: LoginComponent },
    { path: '**', component: Httpstatus404Component },

];

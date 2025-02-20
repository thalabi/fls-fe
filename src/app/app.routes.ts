import { Routes } from '@angular/router';
import { PrimengTestComponent } from './primeng-test/primeng-test.component';
import { LogSheetComponent } from './log-sheet/log-sheet.component';
import { AircraftParametersComponent } from './aircraft-parameters/aircraft-parameters.component';

export const routes: Routes = [
    { path: '', redirectTo: 'log-sheet', pathMatch: 'full' },
    { path: 'test', component: PrimengTestComponent },
    { path: 'log-sheet', component: LogSheetComponent },
    { path: 'ac-parameters', component: AircraftParametersComponent },
];

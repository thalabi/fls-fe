import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { RestService } from '../../service/rest.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FuelLog, FuelTransactionTypeEnum } from '../../domain/FuelLog';
import { FuelLogResponse } from '../../response/FuelLogResponse';
import { AcParameters } from '../../domain/AcParameters';
import { AcParametersResponse } from '../../response/AcParametersResponse';
import { FuelLogFormComponent } from '../form/fuel-log-form/fuel-log-form.component';
import { forkJoin } from 'rxjs';
import { FuelLogRequest } from '../../request/fuel-log-request';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-refuel',
    imports: [FuelLogFormComponent],
    templateUrl: './refuel.component.html',
    styleUrl: './refuel.component.css'
})
export class RefuelComponent implements OnInit {

    readonly AC_REGISTRATION: string = 'C-GQGD'

    loadingStatus!: boolean;

    acParameters!: AcParameters

    fuelLog: FuelLog = {} as FuelLog
    fuelLogToForm!: FuelLog

    constructor(private messageService: MessageService, private restService: RestService, private router: Router, private activatedRoute: ActivatedRoute) { }

    ngOnInit(): void {
        this.messageService.clear()
        forkJoin({

            acParametersResponse: this.restService.getTableData('ac_parameters', `registration|equals|${this.AC_REGISTRATION}`, 0, 1),

            fuelLog: this.restService.getLastFuelLog(this.AC_REGISTRATION)

        }).subscribe(((result: { acParametersResponse: AcParametersResponse; fuelLog: FuelLog }) => {

            console.log('acParametersResponse', result.acParametersResponse);
            const acParametersArray = result.acParametersResponse._embedded.simpleModels || new Array<AcParameters>
            this.acParameters = acParametersArray[0]

            console.log('result.fuelLog', result.fuelLog);
            const fuelLog = result.fuelLog || {} as FuelLog
            this.fuelLog.date = new Date()
            this.fuelLog.transactionType = FuelTransactionTypeEnum.Refuel
            this.fuelLog.registration = this.AC_REGISTRATION
            this.fuelLog.left = fuelLog.left + fuelLog.changeInLeft
            this.fuelLog.right = fuelLog.right + fuelLog.changeInRight
            console.log('this.fuelLog', this.fuelLog)

            this.fuelLogToForm = {} as FuelLog
            this.fuelLogToForm = this.fuelLog // will trigger a change detection and populate the form
        }));
    }

    private fuelLogToFuelLogRequest(fuelLog: FuelLog): FuelLogRequest {
        const fuelLogRequest: FuelLogRequest = {
            registration: fuelLog.registration,
            date: fuelLog.date,
            transactionType: fuelLog.transactionType,
            left: fuelLog.left,
            right: fuelLog.right,
            changeInLeft: fuelLog.changeInLeft,
            changeInRight: fuelLog.changeInRight,
            pricePerLitre: fuelLog.fuelPrice.pricePerLitre,
            airport: fuelLog.fuelPrice.airport,
            fbo: fuelLog.fuelPrice.fbo,
            comment: fuelLog.fuelPrice.comment
        }
        return fuelLogRequest
    }

    onChildFormSubmit(fuelLog: FuelLog) {
        console.log('fuelLog', fuelLog)
        this.restService.addFuelLog(this.fuelLogToFuelLogRequest(fuelLog))
            .subscribe(
                {
                    next: (response: any) => {
                        console.log('response', response)
                    },
                    complete: () => {
                        console.log('http request completed')
                        // this.messageService.add({ severity: 'info', summary: '200', detail: 'Added sucessfully' });
                        this.router.navigate(['fuel-log-maintenance'])
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        console.log('httpErrorResponse', httpErrorResponse)
                    }
                });

    }

    onChildFormCancel() {
        const currentPath = this.router.url;
        console.log('this.activatedRoute', this.activatedRoute)
        this.router.navigateByUrl('/', {
            skipLocationChange: true,

        }).then(() => {
            this.router.navigateByUrl(currentPath)
        })
    }
}

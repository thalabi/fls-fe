import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PriceTypeOptionEnum } from '../maintenance/fuel-log-maintenance.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RestService } from '../../service/rest.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FuelLog } from '../../domain/FuelLog';
import { FuelLogResponse } from '../../response/FuelLogResponse';
import { AcParameters } from '../../domain/AcParameters';
import { AcParametersResponse } from '../../response/AcParametersResponse';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { FuelLogFormComponent } from '../form/fuel-log-form/fuel-log-form.component';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-refuel',
    imports: [FuelLogFormComponent],
    templateUrl: './refuel.component.html',
    styleUrl: './refuel.component.css'
})
export class RefuelComponent implements OnInit {

    readonly AC_REGISTRATION: string = 'C-GQGD'

    loadingStatus!: boolean;

    priceTypeOptions: Array<PriceTypeOptionEnum> = [PriceTypeOptionEnum.PER_LITRE, PriceTypeOptionEnum.TOTAL]

    acParameters!: AcParameters

    fuelLog: FuelLog = {} as FuelLog
    fuelLogToForm!: FuelLog

    constructor(private messageService: MessageService, private restService: RestService,) { }

    ngOnInit(): void {
        this.messageService.clear()
        forkJoin({
            acParametersResponse: this.restService.getTableData('ac_parameters', `registration|equals|${this.AC_REGISTRATION}`, 0, 1),
            fuelLogResponse: this.restService.getLastFuelLog(this.AC_REGISTRATION)
        }).subscribe(((result: { acParametersResponse: AcParametersResponse; fuelLogResponse: FuelLogResponse }) => {
            console.log('acParametersResponse', result.acParametersResponse);
            const acParametersArray = result.acParametersResponse._embedded.simpleModels || new Array<AcParameters>
            this.acParameters = acParametersArray[0]

            console.log('fuelLogResponse', result.fuelLogResponse);
            const fuelLogs = result.fuelLogResponse._embedded.fuelLogs || new Array<FuelLog>
            const inLeftTank = fuelLogs[0].left + fuelLogs[0].changeInLeft
            const inRightTank = fuelLogs[0].right + fuelLogs[0].changeInRight;

            this.fuelLog.date = new Date()
            this.fuelLog.registration = this.AC_REGISTRATION
            this.fuelLog.left = inLeftTank
            this.fuelLog.right = inRightTank
            console.log('fuelLog', this.fuelLog)

            this.fuelLogToForm = this.fuelLog // will trigger a change detection and populate the form
        }));
    }

    onChangeTopUp(event: CheckboxChangeEvent) {
        console.log('onChangeTopUp(), event', event)
        if (event.checked) {

        } else {

        }
    }

    onSubmit() {

    }
    onChildFormSubmit(fuelLog: FuelLog) {
        console.log('fuelLog', fuelLog)
    }


    onCancel() {

    }

}

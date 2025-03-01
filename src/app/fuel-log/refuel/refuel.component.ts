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
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-refuel',
    imports: [CommonModule, ReactiveFormsModule, DatePickerModule, CheckboxModule, InputNumberModule, InputTextModule, SelectModule, MessagesModule, ButtonModule],
    templateUrl: './refuel.component.html',
    styleUrl: './refuel.component.css'
})
export class RefuelComponent implements OnInit {

    readonly AC_REGISTRATION: string = 'C-GQGD'

    loadingStatus!: boolean;

    priceTypeOptions: Array<PriceTypeOptionEnum> = [PriceTypeOptionEnum.PER_LITRE, PriceTypeOptionEnum.TOTAL]

    inLeftTank!: number
    inRightTank!: number

    acParameters!: AcParameters

    form = new FormGroup({
        date: new FormControl<Date>(new Date(), { nonNullable: true, validators: Validators.required }),
        topUp: new FormControl<boolean>(false, { nonNullable: true, validators: Validators.required }),
        addToLeftTank: new FormControl<number | null>(null, Validators.required),
        addToRightTank: new FormControl<number | null>(null, Validators.required),
        priceType: new FormControl<PriceTypeOptionEnum>(PriceTypeOptionEnum.PER_LITRE, { nonNullable: true }), // nonNullable: true, means when the form is reset the default value is used
        price: new FormControl<number | null>(null, Validators.required),
        airport: new FormControl<string>('', Validators.required),
        fbo: new FormControl<string>(''),
        comment: new FormControl<string>(''),
    });

    constructor(private messageService: MessageService, private restService: RestService,) { }

    ngOnInit(): void {
        this.messageService.clear()
        this.getAcParameters()
        this.getRemainingInFuelTanks()
    }

    private getRemainingInFuelTanks() {
        this.restService.getLastFuelLog(this.AC_REGISTRATION)
            .subscribe(
                {
                    next: (fuelLogResponse: FuelLogResponse) => {
                        console.log('fuelLogResponse', fuelLogResponse);
                        const fuelLogs = fuelLogResponse._embedded.fuelLogs || new Array<FuelLog>
                        this.inLeftTank = fuelLogs[0].left + fuelLogs[0].changeInLeft
                        this.inRightTank = fuelLogs[0].right + fuelLogs[0].changeInRight;
                        console.log('in tanks: ', this.inLeftTank, this.inRightTank)
                    },
                    complete: () => {
                        console.log('this.restService.getTableData completed')
                        this.loadingStatus = false
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse): void => {
                        console.log('this.restService.getTableData error')
                        this.loadingStatus = false
                    }
                });

    }

    private getAcParameters() {
        this.restService.getTableData('ac_parameters', `registration|equals|${this.AC_REGISTRATION}`, 0, 1)
            .subscribe(
                {
                    next: (acParametersLogResponse: AcParametersResponse) => {
                        console.log('acParametersLogResponse', acParametersLogResponse);
                        const acParametersArray = acParametersLogResponse._embedded.simpleModels || new Array<AcParameters>
                        this.acParameters = acParametersArray[0]

                    },
                    complete: () => {
                        console.log('this.restService.getTableData completed')
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse): void => {
                        console.log('httpErrorResponse', httpErrorResponse)
                    }
                });
    }

    onChangeTopUp(event: CheckboxChangeEvent) {
        console.log('onChangeTopUp(), event', event)
        if (event.checked) {

        } else {

        }
    }

    onSubmit() {

    }

    onCancel() {

    }

}

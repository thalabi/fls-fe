import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { RestService } from '../service/rest.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HalResponseLinks } from '../response/hal/hal-response-links';
import { HalResponsePage } from '../response/hal/hal-response-page';
import { IGenericEntity } from '../domain/i-gerneric-entity';
import { MessageService } from 'primeng/api';
import { AcParametersResponse } from '../response/AcParametersResponse';
import { AcParameters } from '../domain/AcParameters';

@Component({
    selector: 'app-aircraft-parameters',
    imports: [CommonModule, ReactiveFormsModule, InputNumberModule, ButtonModule],
    templateUrl: './ac-parameters.component.html',
    styleUrl: './ac-parameters.component.css'
})
export class AcParametersComponent implements OnInit {

    readonly AC_REGISTRATION: string = 'C-GQGD'

    initialTsn!: number
    initialTsmoh!: number
    eachTankCapacity!: number
    fuelBurnPerHour!: number

    acParameters!: AcParameters

    form = new FormGroup({
        initialTsn: new FormControl<number | null>(null, Validators.required),
        initialTsmoh: new FormControl<number | null>(null, Validators.required),
        eachTankCapacity: new FormControl<number | null>(null, Validators.required),
        fuelBurnPerHour: new FormControl<number | null>(null, Validators.required),
    })

    constructor(private restService: RestService, private messageService: MessageService) { }

    ngOnInit(): void {
        this.messageService.clear()
        this.getAcParameters()
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

                        this.initForm()
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse): void => {
                        console.log('httpErrorResponse', httpErrorResponse)
                    }
                });
    }
    private initForm() {
        if (this.acParameters) {
            this.form.controls.initialTsn.patchValue(this.acParameters.initialTsn)
            this.form.controls.initialTsmoh.patchValue(this.acParameters.initialTsmoh)
            this.form.controls.eachTankCapacity.patchValue(this.acParameters.eachTankCapacity)
            this.form.controls.fuelBurnPerHour.patchValue(this.acParameters.fuelBurnPerHour)
        } else {
            this.form.reset()
        }


    }
    onSubmit() {
        let acParameters: AcParameters = {} as AcParameters
        acParameters.id = this.acParameters.id
        acParameters.registration = this.AC_REGISTRATION
        acParameters.initialTsn = this.form.controls.initialTsn.value || 0
        acParameters.initialTsmoh = this.form.controls.initialTsmoh.value || 0
        acParameters.eachTankCapacity = this.form.controls.eachTankCapacity.value || 0
        acParameters.fuelBurnPerHour = this.form.controls.fuelBurnPerHour.value || 0
        this.restService.updateAcParameters(acParameters).subscribe({
            next: savedRow => {
                console.log('updated row', savedRow);
            },
            complete: () => {
                console.log('update row is complete')
                this.messageService.add({ severity: 'info', summary: '200', detail: 'Updated sucessfully' });
            },
            error: error => {
                console.error('enericEntityService.updateAssociationGenericEntity returned error: ', error);
            }
        })
    }
    onCancel() {

    }
}

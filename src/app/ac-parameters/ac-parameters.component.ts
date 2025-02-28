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

    initialTsn!: number // from service
    initialTsmoh!: number // from service
    eachTankCapacity!: number // from service
    fuelBurnPerHour!: number // from service

    page: HalResponsePage = {} as HalResponsePage;
    links: HalResponseLinks = {} as HalResponseLinks;
    readonly ROWS_PER_PAGE: number = 10; // default rows per page
    firstRowOfTable!: number; // triggers a page change, zero based. 0 -> first page, 1 -> second page, ...
    pageNumber: number = 0;
    acParameterArray!: Array<AcParameters>
    loadingStatus!: boolean;

    form = new FormGroup({
        initialTsn: new FormControl<number | null>(null, Validators.required),
        initialTsmoh: new FormControl<number | null>(null, Validators.required),
        eachTankCapacity: new FormControl<number | null>(null, Validators.required),
        fuelBurnPerHour: new FormControl<number | null>(null, Validators.required),
    })

    constructor(private restService: RestService, private messageService: MessageService) { }

    ngOnInit(): void {
        // this.form = new FormGroup({
        //     initialTsn: new FormControl<number | null>(null, Validators.required),
        //     initialTsmoh: new FormControl<number | null>(null, Validators.required),
        //     eachTankCapacity: new FormControl<number | null>(null, Validators.required),
        //     fuelBurnPerHour: new FormControl<number | null>(null, Validators.required),
        // })
        this.messageService.clear()
        this.getAcParametersTable()
    }

    getAcParametersTable() {
        this.restService.getTableData('ac_parameters', `registration|equals|${this.AC_REGISTRATION}`, this.pageNumber, this.ROWS_PER_PAGE)
            .subscribe(
                {
                    next: (acParametersLogResponse: AcParametersResponse) => {
                        console.log('acParametersLogResponse', acParametersLogResponse);
                        this.acParameterArray = acParametersLogResponse._embedded.simpleModels || new Array<AcParameters>

                        this.page = acParametersLogResponse.page;
                        this.firstRowOfTable = this.page.number * this.ROWS_PER_PAGE;
                        this.links = acParametersLogResponse._links;
                    },
                    complete: () => {
                        console.log('this.restService.getTableData completed')
                        this.loadingStatus = false

                        this.initForm()
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse): void => {
                        console.log('httpErrorResponse', httpErrorResponse)
                        this.loadingStatus = false
                    }
                });
    }
    private initForm() {
        if (this.acParameterArray.length > 0) {
            const acRegistration = this.acParameterArray[0]
            this.form.controls['initialTsn'].patchValue(acRegistration['initialTsn'])
            this.form.controls['initialTsmoh'].patchValue(acRegistration['initialTsmoh'])
            this.form.controls['eachTankCapacity'].patchValue(acRegistration['eachTankCapacity'])
            this.form.controls['fuelBurnPerHour'].patchValue(acRegistration['fuelBurnPerHour'])
        } else {
            this.form.reset()
        }


    }
    onSubmit() {
        let acParameters: AcParameters = {} as AcParameters
        acParameters.id = this.acParameterArray[0].id
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

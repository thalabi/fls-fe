import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { RestService } from '../rest.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HalResponseLinks } from '../hal/hal-response-links';
import { HalResponsePage } from '../hal/hal-response-page';
import { IGenericEntity } from '../domain/i-gerneric-entity';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-aircraft-parameters',
    imports: [CommonModule, ReactiveFormsModule, InputNumberModule, ButtonModule],
    templateUrl: './aircraft-parameters.component.html',
    styleUrl: './aircraft-parameters.component.css'
})
export class AircraftParametersComponent implements OnInit {

    form!: FormGroup

    initialTsn!: number // from service
    initialTsmoh!: number // from service
    eachTankCapacity!: number // from service
    fuelBurnPerHour!: number // from service

    page: HalResponsePage = {} as HalResponsePage;
    links: HalResponseLinks = {} as HalResponseLinks;
    readonly ROWS_PER_PAGE: number = 10; // default rows per page
    firstRowOfTable!: number; // triggers a page change, zero based. 0 -> first page, 1 -> second page, ...
    pageNumber: number = 0;
    rowArray: Array<IGenericEntity> = [];
    loadingStatus!: boolean;


    constructor(private restService: RestService, private messageService: MessageService) { }

    ngOnInit(): void {
        this.form = new FormGroup({
            initialTsn: new FormControl<number | null>(null, Validators.required),
            initialTsmoh: new FormControl<number | null>(null, Validators.required),
            eachTankCapacity: new FormControl<number | null>(null, Validators.required),
            fuelBurnPerHour: new FormControl<number | null>(null, Validators.required),
        })
        this.restService.getTableData('ac_parameters', '', this.pageNumber, this.ROWS_PER_PAGE, ['registration'])
            .subscribe(
                {
                    next: rowResponse => {
                        console.log('rowResponse', rowResponse);
                        this.page = rowResponse.page;
                        if (rowResponse._embedded) {
                            this.firstRowOfTable = this.page.number * this.ROWS_PER_PAGE;
                            this.rowArray = rowResponse._embedded.simpleModels;
                        } else {
                            this.firstRowOfTable = 0;
                            this.rowArray = [];
                        }
                        this.links = rowResponse._links;

                        this.initForm()
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

    private initForm() {
        if (this.rowArray.length > 0) {
            const acRegistration = this.rowArray[0]
            this.form.controls['initialTsn'].patchValue(acRegistration['initialTsn'])
            this.form.controls['initialTsmoh'].patchValue(acRegistration['initialTsmoh'])
            this.form.controls['eachTankCapacity'].patchValue(acRegistration['eachTankCapacity'])
            this.form.controls['fuelBurnPerHour'].patchValue(acRegistration['fuelBurnPerHour'])
        } else {
            this.form.reset()
        }


    }
    onSubmit() {
        let row: IGenericEntity = {} as IGenericEntity
        row['_links'] = this.rowArray[0]._links
        row['initialTsn'] = this.form.controls['initialTsn'].value
        row['initialTsmoh'] = this.form.controls['initialTsmoh'].value
        row['eachTankCapacity'] = this.form.controls['eachTankCapacity'].value
        row['fuelBurnPerHour'] = this.form.controls['fuelBurnPerHour'].value
        this.restService.updateGenericEntity(row).subscribe({
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

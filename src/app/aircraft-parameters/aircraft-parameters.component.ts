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


    constructor(private restService: RestService) { }

    ngOnInit(): void {
        this.form = new FormGroup({
            initialTsn: new FormControl<number | null>(null, Validators.required),
            initialTsmoh: new FormControl<number | null>(null, Validators.required),
            eachTankCapacity: new FormControl<number | null>(null, Validators.required),
            fuelBurnPerHour: new FormControl<number | null>(null, Validators.required),
        });

        this.restService.getTableData('ac_parameters', '', this.pageNumber, this.ROWS_PER_PAGE, ['registration'])
            .subscribe(
                {
                    // next: (flightLogTotalsVResponse: IFlightLogTotalsVResponse) => {

                    //     this.loadingStatus = false

                    //     console.log('flightLogTotalsVResponse', flightLogTotalsVResponse);
                    //     this.flightLogTotalsVResponse = flightLogTotalsVResponse;
                    //     this.page = this.flightLogTotalsVResponse.page;
                    //     this.flightLogTotalsVs = this.page.totalElements ? this.flightLogTotalsVResponse._embedded.flightLogTotalsVs : [];
                    //     this.clearTimes(this.flightLogTotalsVs);
                    //     console.log('this.flightLogTotalsVs', this.flightLogTotalsVs);
                    //     //this.links = this.flightLogTotalsVResponse._links;

                    //     this.calculatePageTotals(this.flightLogTotalsVs)
                    //     this.pageRowKey = this.flightLogTotalsVs[this.flightLogTotalsVs.length - 1]._links.flightLogTotalsV.href
                    next: rowResponse => {
                        console.log('rowResponse', rowResponse);
                        this.page = rowResponse.page;
                        if (rowResponse._embedded) {
                            this.firstRowOfTable = this.page.number * this.ROWS_PER_PAGE;
                            //this.rowArray = rowResponse._embedded[GenericEntityService.toPlural(this.entityName)];
                            this.rowArray = rowResponse._embedded.simpleModels;
                            //ComponentHelper.setRowArrayDateFields(this.rowArray, this.fieldAttributesArray);
                        } else {
                            this.firstRowOfTable = 0;
                            this.rowArray = [];
                        }
                        this.links = rowResponse._links;
                        this.loadingStatus = false
                    },
                    complete: () => {
                        console.log('this.flightLogService.getTableData2 completed')

                        // this.messageService.clear()
                        // this.uploadProgressMessage = '';
                        // this.uploadResponse = {} as UploadResponse;
                        // this.messageService.add({ severity: 'info', summary: '200', detail: this.tableFileDownloadProgressMessage })
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse): void => {
                        this.loadingStatus = false
                        // this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                    }
                });

    }

    onSubmit() {

    }
    onCancel() {

    }
}

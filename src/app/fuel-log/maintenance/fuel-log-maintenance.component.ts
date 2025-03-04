import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { RestService } from '../../service/rest.service';
import { SessionService } from '../../service/session.service';
import { HttpErrorResponse } from '@angular/common/http';
import { IGenericEntity } from '../../domain/i-gerneric-entity';
import { HalResponseLinks } from '../../response/hal/hal-response-links'
import { HalResponsePage } from '../../response/hal/hal-response-page';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CrudEnum } from '../../crud-enum';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { MessagesModule } from 'primeng/messages';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { FuelLogResponse } from '../../response/FuelLogResponse';
import { FuelLog } from '../../domain/FuelLog';
import { FuelLogFormComponent } from '../form/fuel-log-form/fuel-log-form.component';
import { AcParameters } from '../../domain/AcParameters';
import { AcParametersResponse } from '../../response/AcParametersResponse';

export enum PriceTypeOptionEnum {
    PER_LITRE = 'Per litre', TOTAL = 'Total'
}
@Component({
    selector: 'app-fuel-log',
    imports: [CommonModule, ReactiveFormsModule, TableModule, ButtonModule, DialogModule, SelectModule, MessagesModule, DatePickerModule, CheckboxModule, InputNumberModule, InputTextModule, FuelLogFormComponent],
    templateUrl: './fuel-log-maintenance.component.html',
    styleUrl: './fuel-log-maintenance.component.css'
})

export class FuelLogMaintenaceComponent implements OnInit {

    readonly AC_REGISTRATION: string = 'C-GQGD'
    readonly TABLE_NAME: string = 'fuel_log'

    page: HalResponsePage = {} as HalResponsePage;
    links: HalResponseLinks = {} as HalResponseLinks;
    readonly ROWS_PER_PAGE: number = 10; // default rows per page
    firstRowOfTable!: number; // triggers a page change, zero based. 0 -> first page, 1 -> second page, ...
    pageNumber: number = 0;
    fuelLogArray!: Array<FuelLog>;
    selectedFuelLog!: FuelLog
    crudMode!: CrudEnum;
    crudEnum = CrudEnum; // Used in html to refere to enum
    modifyAndDeleteButtonsDisable: boolean = true;
    displayDialog: boolean = false
    loadingStatus!: boolean;
    savedTableLazyLoadEvent!: TableLazyLoadEvent
    // priceTypeOptions: Array<{ value: string, name: string }> = [{ value: 'per_litre', name: 'Per litre' }, { value: 'total', name: 'Total' }]
    priceTypeOptions: Array<PriceTypeOptionEnum> = [PriceTypeOptionEnum.PER_LITRE, PriceTypeOptionEnum.TOTAL]

    // inLeftTank!: number
    // inRightTank!: number
    acParameters!: AcParameters

    fuelLog: FuelLog = {} as FuelLog
    fuelLogToForm!: FuelLog

    // form = new FormGroup({
    //     date: new FormControl<Date>(new Date(), { nonNullable: true, validators: Validators.required }),
    //     topUp: new FormControl<boolean>(false, { nonNullable: true, validators: Validators.required }),
    //     addToLeftTank: new FormControl<number | null>(null, Validators.required),
    //     addToRightTank: new FormControl<number | null>(null, Validators.required),
    //     priceType: new FormControl<PriceTypeOptionEnum>(PriceTypeOptionEnum.PER_LITRE, { nonNullable: true }), // nonNullable: true, means when the form is reset the default value is used
    //     price: new FormControl<number | null>(null, Validators.required),
    //     airport: new FormControl<string>('', Validators.required),
    //     fbo: new FormControl<string>(''),
    //     comment: new FormControl<string>(''),
    // });

    constructor(
        private restService: RestService,
        private messageService: MessageService,
        private sessionService: SessionService
    ) { }

    ngOnInit(): void {
        this.messageService.clear()
        this.getAcParameters()
        // this.getFuelLogTable()
        //this.initForm()
        // this.getPortfolioTable();
        // this.getInstrumentTable();
        // this.createForm()
    }
    private getAcParameters() {
        this.restService.getTableData('ac_parameters', `registration|equals|${this.AC_REGISTRATION}`, 0, 1).subscribe((acParametersResponse: AcParametersResponse) => {
            console.log('acParametersResponse', acParametersResponse);
            const acParametersArray = acParametersResponse._embedded.simpleModels || new Array<AcParameters>
            this.acParameters = acParametersArray[0]
        })
    }
    onLazyLoad(lazyLoadEvent: TableLazyLoadEvent) {
        this.savedTableLazyLoadEvent = lazyLoadEvent;
        this.fetchPage(lazyLoadEvent)
    }
    //
    // TODO, to add filter by price and airport 
    //
    fetchPage(tableLazyLoadEvent: TableLazyLoadEvent) {
        console.log(tableLazyLoadEvent)
        this.loadingStatus = true
        const pageSize = tableLazyLoadEvent.rows ?? 20
        const pageNumber = (tableLazyLoadEvent.first ?? 0) / pageSize;
        //const filters: { [s: string]: FilterMetadata[] } | undefined = lazyLoadEvent.filters
        const filters: any = tableLazyLoadEvent.filters
        console.log('filters', filters)
        console.log('pageNumber', pageNumber, 'pageSize', pageSize, 'filters', filters)
        let searchCriteria: string = ''
        if (filters) {
            console.log('Object.keys(filters)', Object.keys(filters))
            Object.keys(filters).forEach(columnName => {
                console.log('columeName', columnName, 'matchMode', filters[columnName][0].matchMode, 'value', filters[columnName][0].value)
                //searchCriteria += columnName + filters[columnName][0].matchMode + filters[columnName][0].value + ","
                if (filters[columnName][0].value !== null) {
                    if (filters[columnName][0].value instanceof Date) {
                        searchCriteria += columnName + '|' + filters[columnName][0].matchMode + '|' + new Date(filters[columnName][0].value).toISOString() + ","
                    } else {
                        searchCriteria += columnName + '|' + filters[columnName][0].matchMode + '|' + filters[columnName][0].value + ","
                    }
                }
            })
            if (searchCriteria.length > 0) {
                searchCriteria = searchCriteria.slice(0, searchCriteria.length - 1)
            }
            console.log('searchCriteria', searchCriteria)
        }
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(this.TABLE_NAME))
        console.log('entityNameResource 2', entityNameResource)
        this.restService.getTableData(this.TABLE_NAME, `registration|equals|${this.AC_REGISTRATION}` + searchCriteria, pageNumber, pageSize, ['date'])
            .subscribe(
                {
                    next: (fuelLogResponse: FuelLogResponse) => {
                        console.log('fuelLogResponse', fuelLogResponse);
                        this.fuelLogArray = fuelLogResponse._embedded.simpleModels || new Array<FuelLog>

                        this.page = fuelLogResponse.page;
                        this.firstRowOfTable = this.page.number * this.ROWS_PER_PAGE;
                        this.links = fuelLogResponse._links;
                    },
                    complete: () => {
                        console.log('this.restService.getTableData completed')
                        this.loadingStatus = false
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse): void => {
                        console.log('httpErrorResponse', httpErrorResponse)
                        this.loadingStatus = false
                    }
                });
    }

    private getFuelLogTable() {
        this.restService.getTableData('fuel_log', `registration|equals|${this.AC_REGISTRATION}`, this.pageNumber, this.ROWS_PER_PAGE, ['date'])
            .subscribe(
                {
                    next: (fuelLogResponse: FuelLogResponse) => {
                        console.log('fuelLogResponse', fuelLogResponse);
                        this.fuelLogArray = fuelLogResponse._embedded.simpleModels || new Array<FuelLog>

                        // this.populateDateFields(this.fuelLogArray)
                        // console.log('this.fuelLogArray', this.fuelLogArray)

                        this.page = fuelLogResponse.page;
                        this.firstRowOfTable = this.page.number * this.ROWS_PER_PAGE;
                        this.links = fuelLogResponse._links;
                    },
                    complete: () => {
                        console.log('this.restService.getTableData completed')
                        this.loadingStatus = false
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse): void => {
                        console.log('httpErrorResponse', httpErrorResponse)
                        this.loadingStatus = false
                    }
                });
    }
    onRowSelect(event: any) {
        console.log(event);
        console.log('onRowSelect()')
        if (! /* not */ this.selectedFuelLog) {
            this.modifyAndDeleteButtonsDisable = true
            return
        }
        this.modifyAndDeleteButtonsDisable = false;

        //     this.crudFlightLog = FlightLogHelper.copyFlogLogProperties(this.selectedFlightLogTotalsV);
        //     console.log('this.selectedFlightLogTotalsV', this.selectedFlightLogTotalsV)
        //     console.log('this.crudFlightLog', this.crudFlightLog)
        //     this.modifyAndDeleteButtonsDisable = false;
        //     this.fromAirport = {} as Airport;
        //     this.fromAirport.identifier = this.crudFlightLog.routeFrom;
        //     this.toAirport = {} as Airport;
        //     this.toAirport.identifier = this.crudFlightLog.routeTo;
    }
    onRowUnselect(event: any) {
        console.log(event);
        this.modifyAndDeleteButtonsDisable = true;
        //     //this.selectedFlightLog = {} as FlightLog; // This a hack. If don't init selectedFlightLog, dialog will produce exception
        //     this.selectedFlightLogTotalsV = {} as IFlightLogTotalsV; // This a hack. If don't init selectedFlightLogTotalsV, dialog will produce exception
    }
    showDialog(crudMode: CrudEnum) {
        this.displayDialog = true;
        this.sessionService.setDisableParentMessages(true)
        this.crudMode = crudMode;
        console.log('this.crudMode', this.crudMode);
        switch (this.crudMode) {
            case CrudEnum.ADD:
                this.fuelLog = {} as FuelLog
                this.fuelLog.date = new Date()
                this.fuelLog.registration = this.AC_REGISTRATION
                this.fuelLogToForm = this.fuelLog // will trigger a change detection and populate the form
                break;
            case CrudEnum.UPDATE:
                console.log('this.selectedFuelLog', this.selectedFuelLog)
                this.fuelLogToForm = this.selectedFuelLog // will trigger a change detection and populate the form
                console.log('this.fuelLogToForm', this.fuelLogToForm)
                break;
            case CrudEnum.DELETE:
                // this.fillInFormWithValues();
                //this.form.disable();
                this.fuelLogToForm = this.selectedFuelLog // will trigger a change detection and populate the form
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
    }

    onChildFormSubmit(fuelLog: FuelLog) {
        console.log('fuelLog', fuelLog)
        switch (this.crudMode) {
            case CrudEnum.ADD:
                this.restService.addFuelLog(fuelLog)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.messageService.add({ severity: 'info', summary: '200', detail: 'Added sucessfully' });
                                this.afterCrud()

                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                console.log('httpErrorResponse', httpErrorResponse)
                            }
                        });
                break
            case CrudEnum.UPDATE:
                this.restService.updateFuelLog(fuelLog)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.messageService.add({ severity: 'info', summary: '200', detail: 'Updated sucessfully' });
                                this.afterCrud()

                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                console.log('httpErrorResponse', httpErrorResponse)
                            }
                        });
                break;
            case CrudEnum.DELETE:
                this.restService.deleteFuelLog(fuelLog.id)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.messageService.add({ severity: 'info', summary: '200', detail: 'Deleted sucessfully' });
                                this.afterCrud()
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                console.log('httpErrorResponse', httpErrorResponse)
                            }
                        });
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
    }
    private afterCrud() {
        this.displayDialog = false;
        this.modifyAndDeleteButtonsDisable = true;
        this.onLazyLoad(this.savedTableLazyLoadEvent);
        this.selectedFuelLog = {} as FuelLog
    }

    onCancel() {
        this.displayDialog = false;
        this.sessionService.setDisableParentMessages(false)
        this.modifyAndDeleteButtonsDisable = true
    }
    onChildFormCancel() {
        this.displayDialog = false;
        this.sessionService.setDisableParentMessages(false)
        this.modifyAndDeleteButtonsDisable = true
    }

}


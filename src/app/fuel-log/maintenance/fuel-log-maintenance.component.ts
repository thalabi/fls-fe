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

    // priceTypeOptions: Array<{ value: string, name: string }> = [{ value: 'per_litre', name: 'Per litre' }, { value: 'total', name: 'Total' }]
    priceTypeOptions: Array<PriceTypeOptionEnum> = [PriceTypeOptionEnum.PER_LITRE, PriceTypeOptionEnum.TOTAL]

    // inLeftTank!: number
    // inRightTank!: number
    acParameters!: AcParameters

    fuelLog: FuelLog = {} as FuelLog
    fuelLogToForm!: FuelLog

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

    constructor(
        private restService: RestService,
        private messageService: MessageService,
        private sessionService: SessionService
    ) { }

    ngOnInit(): void {
        this.messageService.clear()
        this.getAcParameters()
        this.getFuelLogTable()
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
        this.restService.getTableData(this.TABLE_NAME, searchCriteria, pageNumber, pageSize, ['date'])
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

    getFuelLogTable() {
        this.restService.getTableData('fuel_log', `registration|equals|${this.AC_REGISTRATION}`, this.pageNumber, this.ROWS_PER_PAGE, ['date'])
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
                this.getRemainingInFuelTanks()
                this.form.reset()
                this.form.enable();
                break;
            case CrudEnum.UPDATE:
                // this.fillInFormWithValues();
                this.form.enable();
                break;
            case CrudEnum.DELETE:
                // this.fillInFormWithValues();
                this.form.disable();
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
    }
    private getRemainingInFuelTanks() {
        this.restService.getLastFuelLog(this.AC_REGISTRATION)
            .subscribe(
                {
                    next: (fuelLogResponse: FuelLogResponse) => {
                        console.log('fuelLogResponse', fuelLogResponse);
                        const fuelLogs = fuelLogResponse._embedded.fuelLogs || new Array<FuelLog>
                        const inLeftTank = fuelLogs[0].left + fuelLogs[0].changeInLeft
                        const inRightTank = fuelLogs[0].right + fuelLogs[0].changeInRight;

                        this.fuelLog.date = new Date()
                        this.fuelLog.registration = this.AC_REGISTRATION
                        this.fuelLog.left = inLeftTank
                        this.fuelLog.right = inRightTank
                        console.log('fuelLog', this.fuelLog)

                        this.fuelLogToForm = this.fuelLog // will trigger a change detection and populate the form
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
    // private fillInFormWithValues() {
    //     console.log('this.selectedRow', this.selectedFuelLog)
    //     //this.form.controls['registration'].patchValue(this.selectedRow['registration']);
    //     this.form.controls.date.patchValue(new Date(this.selectedFuelLog.date));
    //     this.inLeftTank = this.selectedFuelLog.left
    //     this.inRightTank = this.selectedFuelLog.right
    //     this.form.controls.topUp.patchValue(false);
    //     this.form.controls.addToLeftTank.patchValue(this.selectedFuelLog.changeInLeft);
    //     this.form.controls.addToRightTank.patchValue(this.selectedFuelLog.changeInRight);
    //     this.form.controls.priceType.patchValue(PriceTypeOptionEnum.PER_LITRE);
    //     this.form.controls.price.patchValue(this.selectedFuelLog.pricePerLitre);
    //     this.form.controls.airport.patchValue(this.selectedFuelLog.airport);
    //     this.form.controls.fbo.patchValue(this.selectedFuelLog.fbo);
    //     this.form.controls.comment.patchValue(this.selectedFuelLog.comment);
    //     console.log('this.form.value', this.form.value)
    // }

    onChangeTopUp(event: CheckboxChangeEvent) {
        console.log('onChangeTopUp(), event', event)
        if (event.checked) {

        } else {

        }
    }

    onChildFormSubmit(fuelLog: FuelLog) {
        console.log('fuelLog', fuelLog)
        this.restService.saveFuelLog(fuelLog)
            .subscribe(
                {
                    next: (response: any) => {
                        console.log('response', response)
                    },
                    complete: () => {
                        console.log('http request completed')
                        this.messageService.add({ severity: 'info', summary: '200', detail: 'Added sucessfully' });

                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        console.log('httpErrorResponse', httpErrorResponse)
                    }
                });
        this.displayDialog = false;

    }

    // onSubmit() {
    //     console.log('onSubmit()', this.form.value);
    //     let saveFuelLog: FuelLog = {} as FuelLog
    //     switch (this.crudMode) {
    //         case CrudEnum.ADD:
    //             saveFuelLog.date = this.form.controls.date.value
    //             saveFuelLog.registration = this.AC_REGISTRATION
    //             saveFuelLog.left = this.inLeftTank
    //             saveFuelLog.right = this.inRightTank
    //             saveFuelLog.changeInLeft = this.form.controls.addToLeftTank.value!
    //             saveFuelLog.changeInRight = this.form.controls.addToRightTank.value!
    //             saveFuelLog.pricePerLitre = this.calculatePricePerLitre(this.form.controls.priceType.value, this.form.controls.price.value, this.form.controls.addToLeftTank.value, this.form.controls.addToRightTank.value)
    //             saveFuelLog.airport = this.form.controls.airport.value!
    //             saveFuelLog.fbo = this.form.controls.fbo.value!
    //             saveFuelLog.comment = this.form.controls.comment.value!
    //             console.log('saveFuelLog', saveFuelLog)
    //             this.restService.saveFuelLog(saveFuelLog)
    //                 .subscribe(
    //                     {
    //                         next: (response: any) => {
    //                             console.log('response', response)
    //                         },
    //                         complete: () => {
    //                             console.log('http request completed')
    //                             this.displayDialog = false;
    //                             this.sessionService.setDisableParentMessages(false)
    //                             this.selectedFuelLog = {} as FuelLog
    //                             this.getFuelLogTable() // do not refactor this and move it after the switch as it needs to execute after request completes
    //                         },
    //                         error: (httpErrorResponse: HttpErrorResponse) => {
    //                             console.log('httpErrorResponse', httpErrorResponse)
    //                         }
    //                     });
    //             break;
    //         case CrudEnum.UPDATE:
    //             // saveFuelLog.id = this.portfolioSelectedRow.id
    //             // saveFuelLog.version = this.portfolioSelectedRow.version
    //             // saveFuelLog.name = this.portfolioForm.controls.name.value
    //             // saveFuelLog.holder = this.portfolioForm.controls.holder.value
    //             // saveFuelLog.portfolioId = this.portfolioForm.controls.portfolioId.value
    //             // saveFuelLog.financialInstitution = this.portfolioForm.controls.financialInstitution.value
    //             // saveFuelLog.currency = this.portfolioForm.controls.currency.value
    //             // saveFuelLog.logicallyDeleted = this.portfolioForm.controls.logicallyDeleted.value
    //             // console.log('savePortfolio', saveFuelLog)
    //             // this.restService.savePortfolio(saveFuelLog)
    //             //     .subscribe(
    //             //         {
    //             //             next: (response: any) => {
    //             //                 console.log('response', response)
    //             //             },
    //             //             complete: () => {
    //             //                 console.log('http request completed')
    //             //                 this.getPortfoliosWithDependentFlags()
    //             //                 this.displayDialog = false;
    //             //                 this.sessionService.setDisableParentMessages(false)
    //             //                 this.portfolioSelectedRow = {} as Portfolio
    //             //             },
    //             //             error: (httpErrorResponse: HttpErrorResponse) => {
    //             //                 this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
    //             //             }
    //             //         });
    //             break;
    //         case CrudEnum.DELETE:
    //             this.restService.deleteFuelLog(this.selectedFuelLog.id)
    //                 .subscribe(
    //                     {
    //                         next: (response: any) => {
    //                             console.log('response', response)
    //                         },
    //                         complete: () => {
    //                             console.log('http request completed')
    //                             this.displayDialog = false;
    //                             this.sessionService.setDisableParentMessages(false)
    //                             this.selectedFuelLog = {} as FuelLog
    //                             this.getFuelLogTable() // do not refactor this and move it after the switch as it needs to execute after request completes
    //                         },
    //                         error: (httpErrorResponse: HttpErrorResponse) => {
    //                             console.log('httpErrorResponse', httpErrorResponse)
    //                         }
    //                     });
    //             break;
    //         default:
    //             console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
    //     }
    //     this.form.reset()
    //     this.modifyAndDeleteButtonsDisable = true
    // }

    private afterCrud() {
        // this.displayDialog = false;
        this.modifyAndDeleteButtonsDisable = true;
        // this.fetchPage(this.savedLazyLoadEvent.first || 0, this.savedLazyLoadEvent.rows || 0,
        //     ComponentHelper.buildSearchString(this.savedLazyLoadEvent, this.formAttributes.fields.map(field => field.columnName)),
        //     this.formAttributes.queryOrderByColumns);
        // this.resetDialoForm();
        // this.onLazyLoad(this.savedLazyLoadEvent);
    }
    onCancel() {
        this.resetDialoForm();
        this.displayDialog = false;
        this.sessionService.setDisableParentMessages(false)
        this.modifyAndDeleteButtonsDisable = true
    }
    onChildFormCancel() {
        this.displayDialog = false;
        this.sessionService.setDisableParentMessages(false)
        this.modifyAndDeleteButtonsDisable = true
    }
    private resetDialoForm() {
        this.form.reset()
        this.selectedFuelLog = {} as FuelLog
    }

}


import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RestService } from '../service/rest.service';
import { SessionService } from '../service/session.service';
import { HttpErrorResponse } from '@angular/common/http';
import { IGenericEntity } from '../domain/i-gerneric-entity';
import { HalResponseLinks } from '../response/hal/hal-response-links'
import { HalResponsePage } from '../response/hal/hal-response-page';
import { TableModule } from 'primeng/table';
import { CrudEnum } from '../crud-enum';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { MessagesModule } from 'primeng/messages';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { FuelLogResponse } from '../response/FuelLogResponse';
import { FuelLog } from '../domain/FuelLog';

export enum PriceTypeOptionEnum {
    PER_LITRE = 'Per litre', TOTAL = 'Total'
}
@Component({
    selector: 'app-fuel-log',
    imports: [CommonModule, ReactiveFormsModule, TableModule, ButtonModule, DialogModule, SelectModule, MessagesModule, DatePickerModule, CheckboxModule, InputNumberModule, InputTextModule],
    templateUrl: './fuel-log-maintenance.component.html',
    styleUrl: './fuel-log-maintenance.component.css'
})

export class FuelLogMaintenaceComponent implements OnInit {

    readonly AC_REGISTRATION: string = 'C-GQGD'

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

    inLeftTank!: number
    inRightTank!: number

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
        this.getFuelLogTable()
        //this.initForm()
        // this.getPortfolioTable();
        // this.getInstrumentTable();
        // this.createForm()
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

    // initForm() {
    //     const now: Date = new Date()
    //     this.form = new FormGroup({
    //         date: new FormControl<Date>(now, { nonNullable: true, validators: Validators.required }),
    //         topUp: new FormControl<boolean>(false, { nonNullable: true, validators: Validators.required }),
    //         addToLeftTank: new FormControl<number | null>(null, Validators.required),
    //         addToRightTank: new FormControl<number | null>(null, Validators.required),
    //         priceType: new FormControl<PriceTypeOptionEnum>(PriceTypeOptionEnum.PER_LITRE, Validators.required),
    //         price: new FormControl<number | null>(null, Validators.required),
    //         airport: new FormControl<string>('', Validators.required),
    //         fbo: new FormControl<string>(''),
    //         comment: new FormControl<string>(''),
    //     });
    //     this.form2.controls.
    // }

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
                this.getLastFuelLog()
                this.form.reset()
                this.form.enable();
                break;
            case CrudEnum.UPDATE:
                this.fillInFormWithValues();
                this.form.enable();
                break;
            case CrudEnum.DELETE:
                this.fillInFormWithValues();
                this.form.disable();
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
        // this.crudMode = crudMode;
        // console.log('crudMode', crudMode);
        // console.log('this.crudMode', this.crudMode);

        // switch (this.crudMode) {
        //     case CrudEnum.ADD:
        //         this.flightLogForm.reset();
        //         this.flightLogForm.get('flightDate')?.setValue(new Date());
        //         this.flightLogForm.get('makeModel')?.setValue('PA28-181');
        //         this.flightLogForm.get('registration')?.setValue('GQGD');
        //         this.flightLogForm.get('pic')?.setValue('Self');
        //         let cyooAirport: Airport = {} as Airport
        //         cyooAirport.identifier = 'CYOO';
        //         this.flightLogForm.get('fromAirport')?.setValue(cyooAirport);
        //         this.flightLogForm.get('toAirport')?.setValue(cyooAirport);
        //         this.flightLogForm.get('remarks')?.setValue('VFR - ');
        //         FlightLogHelper.enableForm(this.flightLogForm);
        //         this.crudFlightLog = {} as FlightLog;
        //         break;
        //     case CrudEnum.UPDATE:
        //         FlightLogHelper.copyToForm(this.crudFlightLog, this.flightLogForm);
        //         FlightLogHelper.enableForm(this.flightLogForm);
        //         break;
        //     case CrudEnum.DELETE:
        //         FlightLogHelper.copyToForm(this.crudFlightLog, this.flightLogForm);
        //         FlightLogHelper.disableForm(this.flightLogForm);
        //         break;
        //     default:
        //         console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        // }
        // this.displayDialog = true;
    }
    private getLastFuelLog() {
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
    private fillInFormWithValues() {
        console.log('this.selectedRow', this.selectedFuelLog)
        //this.form.controls['registration'].patchValue(this.selectedRow['registration']);
        this.form.controls.date.patchValue(new Date(this.selectedFuelLog['date']));
        this.inLeftTank = this.selectedFuelLog['left']
        this.inRightTank = this.selectedFuelLog['right']
        this.form.controls['topUp'].patchValue(false);
        this.form.controls['addToLeftTank'].patchValue(this.selectedFuelLog['changeInLeft']);
        this.form.controls['addToRightTank'].patchValue(this.selectedFuelLog['changeInRight']);
        this.form.controls['priceType'].patchValue(PriceTypeOptionEnum.PER_LITRE);
        this.form.controls['price'].patchValue(this.selectedFuelLog['pricePerLitre']);
        this.form.controls['airport'].patchValue(this.selectedFuelLog['airport']);
        this.form.controls['fbo'].patchValue(this.selectedFuelLog['fbo']);
        this.form.controls['comment'].patchValue(this.selectedFuelLog['comment']);
        console.log('this.form.value', this.form.value)
    }

    onChangeTopUp(event: CheckboxChangeEvent) {
        console.log('onChangeTopUp(), event', event)
        if (event.checked) {

        } else {

        }
    }
    onSubmit() {
        console.log('onSubmit()', this.form.value);
        let saveFuelLog: FuelLog = {} as FuelLog
        switch (this.crudMode) {
            case CrudEnum.ADD:
                saveFuelLog.date = this.form.controls.date.value
                saveFuelLog.registration = this.AC_REGISTRATION
                saveFuelLog.left = this.inLeftTank
                saveFuelLog.right = this.inRightTank
                saveFuelLog.changeInLeft = this.form.controls.addToLeftTank.value!
                saveFuelLog.changeInRight = this.form.controls.addToRightTank.value!
                saveFuelLog.pricePerLitre = this.calculatePricePerLitre(this.form.controls.priceType.value, this.form.controls.price.value, this.form.controls.addToLeftTank.value, this.form.controls.addToRightTank.value)
                saveFuelLog.airport = this.form.controls.airport.value!
                saveFuelLog.fbo = this.form.controls.fbo.value!
                saveFuelLog.comment = this.form.controls.comment.value!
                console.log('saveFuelLog', saveFuelLog)
                this.restService.saveFuelLog(saveFuelLog)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.selectedFuelLog = {} as FuelLog
                                this.getFuelLogTable() // do not refactor this and move it after the switch as it needs to execute after request completes
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                console.log('httpErrorResponse', httpErrorResponse)
                            }
                        });
                break;
            case CrudEnum.UPDATE:
                // saveFuelLog.id = this.portfolioSelectedRow.id
                // saveFuelLog.version = this.portfolioSelectedRow.version
                // saveFuelLog.name = this.portfolioForm.controls.name.value
                // saveFuelLog.holder = this.portfolioForm.controls.holder.value
                // saveFuelLog.portfolioId = this.portfolioForm.controls.portfolioId.value
                // saveFuelLog.financialInstitution = this.portfolioForm.controls.financialInstitution.value
                // saveFuelLog.currency = this.portfolioForm.controls.currency.value
                // saveFuelLog.logicallyDeleted = this.portfolioForm.controls.logicallyDeleted.value
                // console.log('savePortfolio', saveFuelLog)
                // this.restService.savePortfolio(saveFuelLog)
                //     .subscribe(
                //         {
                //             next: (response: any) => {
                //                 console.log('response', response)
                //             },
                //             complete: () => {
                //                 console.log('http request completed')
                //                 this.getPortfoliosWithDependentFlags()
                //                 this.displayDialog = false;
                //                 this.sessionService.setDisableParentMessages(false)
                //                 this.portfolioSelectedRow = {} as Portfolio
                //             },
                //             error: (httpErrorResponse: HttpErrorResponse) => {
                //                 this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                //             }
                //         });
                break;
            case CrudEnum.DELETE:
                this.restService.deleteFuelLog(this.selectedFuelLog.id)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.selectedFuelLog = {} as FuelLog
                                this.getFuelLogTable() // do not refactor this and move it after the switch as it needs to execute after request completes
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                console.log('httpErrorResponse', httpErrorResponse)
                            }
                        });
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
        this.form.reset()
        this.modifyAndDeleteButtonsDisable = true
    }
    private calculatePricePerLitre(priceType: PriceTypeOptionEnum, price: number | null, addToLeftTank: number | null, addToRightTank: number | null): number {
        if (priceType == PriceTypeOptionEnum.PER_LITRE) {
            return price!
        } else {
            return price! + addToLeftTank! + addToRightTank!
        }
    }

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
    private resetDialoForm() {
        this.form.reset()
        this.selectedFuelLog = {} as FuelLog
    }

}


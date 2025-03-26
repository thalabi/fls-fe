import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RestService } from '../../service/rest.service';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CrudEnum } from '../../crud-enum';
import { HalResponseLinks } from '../../response/hal/hal-response-links';
import { HalResponsePage } from '../../response/hal/hal-response-page';
import { LogSheet } from '../../domain/LogSheet';
import { SessionService } from '../../service/session.service';
import { LogSheetResponse } from '../../response/LogSheetResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { LogSheetRequest } from '../../request/log-sheet-request';
import { BackendStacktraceDisplayComponent } from '../../backend-stacktrace-display/backend-stacktrace-display.component';
import { MessagesModule } from 'primeng/messages';
import { CheckboxModule } from 'primeng/checkbox';
import { filter, take } from 'rxjs';

@Component({
    selector: 'app-log-sheet-maintenance',
    imports: [CommonModule, ReactiveFormsModule, TableModule, DatePickerModule, ButtonModule, DialogModule, InputNumberModule, InputTextModule, MessagesModule, BackendStacktraceDisplayComponent, CheckboxModule],
    templateUrl: './log-sheet-maintenance.component.html',
    styleUrl: './log-sheet-maintenance.component.css'
})
export class LogSheetMaintenanceComponent implements OnInit {

    readonly AC_REGISTRATION: string = 'C-GQGD'
    readonly TABLE_NAME: string = 'log_sheet'

    page: HalResponsePage = {} as HalResponsePage;
    links: HalResponseLinks = {} as HalResponseLinks;
    readonly ROWS_PER_PAGE: number = 10; // default rows per page
    firstRowOfTable!: number; // triggers a page change, zero based. 0 -> first page, 1 -> second page, ...
    pageNumber: number = 0;
    logSheetArray!: Array<LogSheet>;
    selectedLogSheet!: LogSheet
    crudMode!: CrudEnum;
    crudEnum = CrudEnum; // Used in html to refere to enum
    modifyAndDeleteButtonsDisable: boolean = true;
    displayDialog: boolean = false
    loadingStatus!: boolean;
    savedTableLazyLoadEvent!: TableLazyLoadEvent

    form = new FormGroup({
        date: new FormControl<Date>(new Date(), { nonNullable: true, validators: Validators.required }),
        from: new FormControl<string>('', Validators.required),
        to: new FormControl<string>('', Validators.required),
        airtime: new FormControl<number | null>(null, Validators.required),
        flightTime: new FormControl<number | null>(null, Validators.required),
        updateJourneyLog: new FormControl<boolean>(true, Validators.required),
        updateEngineLog: new FormControl<boolean>(true, Validators.required),
    });

    constructor(
        private messageService: MessageService,
        private restService: RestService,
        private sessionService: SessionService
    ) { }

    ngOnInit() {
        this.messageService.clear()
        this.sessionService.setDisableParentMessages(false)
    }
    onLazyLoad(lazyLoadEvent: TableLazyLoadEvent) {
        this.savedTableLazyLoadEvent = lazyLoadEvent;
        this.fetchPage(lazyLoadEvent)
    }

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
                    next: (logSheetResponse: LogSheetResponse) => {
                        console.log('logSheetResponse', logSheetResponse);
                        this.logSheetArray = logSheetResponse._embedded.simpleModels || new Array<LogSheet>

                        this.page = logSheetResponse.page;
                        this.firstRowOfTable = this.page.number * this.ROWS_PER_PAGE;
                        this.links = logSheetResponse._links;
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
        if (! /* not */ this.selectedLogSheet) {
            this.modifyAndDeleteButtonsDisable = true
            return
        }
        this.modifyAndDeleteButtonsDisable = false;

    }
    onRowUnselect(event: any) {
        console.log(event);
        this.modifyAndDeleteButtonsDisable = true;
        this.selectedLogSheet = {} as LogSheet
    }
    showDialog(crudMode: CrudEnum) {
        this.displayDialog = true;
        this.sessionService.setDisableParentMessages(true)
        this.crudMode = crudMode;
        console.log('this.crudMode', this.crudMode);
        this.form.reset()
        switch (this.crudMode) {
            case CrudEnum.ADD:
                this.form.controls.date.setValue(new Date())
                this.form.controls.updateJourneyLog.setValue(true)
                this.form.controls.updateEngineLog.setValue(true)
                this.form.enable()
                break;
            case CrudEnum.UPDATE:
                console.log('this.selectedLogSheet', this.selectedLogSheet)
                this.selectedLogSheet.date
                this.selectedLogSheet.from
                this.selectedLogSheet.airtime
                this.selectedLogSheet.flightTime
                this.form.setValue({
                    date: new Date(this.selectedLogSheet.date),
                    from: this.selectedLogSheet.from,
                    to: this.selectedLogSheet.to,
                    airtime: this.selectedLogSheet.airtime,
                    flightTime: this.selectedLogSheet.flightTime,
                    updateJourneyLog: true,
                    updateEngineLog: true
                })
                this.form.enable()
                break;
            case CrudEnum.DELETE:
                this.form.setValue({
                    date: new Date(this.selectedLogSheet.date),
                    from: this.selectedLogSheet.from,
                    to: this.selectedLogSheet.to,
                    airtime: this.selectedLogSheet.airtime,
                    flightTime: this.selectedLogSheet.flightTime,
                    updateJourneyLog: true,
                    updateEngineLog: true
                })
                this.form.disable()
                this.form.controls.updateJourneyLog.enable()
                this.form.controls.updateEngineLog.enable()
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
    }
    onCancel() {
        this.afterCrud()
    }
    onSubmit() {
        console.log('this.form', this.form)
        const logSheetRequest: LogSheetRequest = {} as LogSheetRequest

        console.log('logSheetRequest', logSheetRequest)

        switch (this.crudMode) {
            case CrudEnum.ADD:
                logSheetRequest.registration = this.AC_REGISTRATION
                logSheetRequest.date = this.form.controls.date.value
                logSheetRequest.from = this.form.controls.from.value!.toUpperCase()
                logSheetRequest.to = this.form.controls.to.value!.toUpperCase()
                logSheetRequest.airtime = this.form.controls.airtime.value!
                logSheetRequest.flightTime = this.form.controls.flightTime.value!
                // logSheetRequest.updateJourneyLog = this.form.controls.updateJourneyLog.value!
                // logSheetRequest.updateEngineLog = this.form.controls.updateEngineLog.value!
                this.restService.addLogSheet(logSheetRequest)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.afterCrud()
                                // this.sessionService.disableParentMessages$
                                //     .pipe(
                                //         filter(disableParentMessages => !disableParentMessages), // Only emit when it's false
                                //         take(1) // Unsubscribe automatically after the first `false`
                                //     )
                                //     .subscribe(() => {
                                //         this.messageService.add({ severity: 'info', summary: '200', detail: 'Added successfully' });
                                //     });
                                this.messageService.add({ severity: 'info', summary: '200', detail: 'Added successfully' });

                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                console.log('httpErrorResponse', httpErrorResponse)
                            }
                        });
                break
            case CrudEnum.UPDATE:
                logSheetRequest.id = this.selectedLogSheet.id
                logSheetRequest.registration = this.AC_REGISTRATION
                logSheetRequest.date = this.form.controls.date.value
                logSheetRequest.from = this.form.controls.from.value!.toUpperCase()
                logSheetRequest.to = this.form.controls.to.value!.toUpperCase()
                logSheetRequest.airtime = this.form.controls.airtime.value!
                logSheetRequest.flightTime = this.form.controls.flightTime.value!
                // logSheetRequest.updateJourneyLog = this.form.controls.updateJourneyLog.value!
                // logSheetRequest.updateEngineLog = this.form.controls.updateEngineLog.value!
                this.restService.updateLogSheet(logSheetRequest)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.afterCrud()
                                // this.sessionService.disableParentMessages$
                                //     .pipe(
                                //         filter(disableParentMessages => !disableParentMessages), // Only emit when it's false
                                //         take(1) // Unsubscribe automatically after the first `false`
                                //     )
                                //     .subscribe(() => {
                                //         this.messageService.add({ severity: 'info', summary: '200', detail: 'Updated successfully' });
                                //     });
                                this.messageService.add({ severity: 'info', summary: '200', detail: 'Updated successfully' });

                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                console.log('httpErrorResponse', httpErrorResponse)
                            }
                        });
                break;
            case CrudEnum.DELETE:
                logSheetRequest.id = this.selectedLogSheet.id
                // logSheetRequest.updateJourneyLog = this.form.controls.updateJourneyLog.value!
                // logSheetRequest.updateEngineLog = this.form.controls.updateEngineLog.value!
                this.restService.deleteLogSheet(logSheetRequest)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.afterCrud()
                                // this.sessionService.disableParentMessages$
                                //     .pipe(
                                //         filter(disableParentMessages => !disableParentMessages), // Only emit when it's false
                                //         take(1) // Unsubscribe automatically after the first `false`
                                //     )
                                //     .subscribe(() => {
                                //         this.messageService.add({ severity: 'info', summary: '200', detail: 'Deleted successfully' });
                                //     });
                                this.messageService.add({ severity: 'info', summary: '200', detail: 'Deleted successfully' });

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
        this.displayDialog = false
        this.sessionService.setDisableParentMessages(false)
        this.modifyAndDeleteButtonsDisable = true;
        this.onLazyLoad(this.savedTableLazyLoadEvent);
        this.form.reset()
        this.selectedLogSheet = {} as LogSheet

    }

    /*

    FlightLogHelper.copyFromForm(this.flightLogForm, this.crudFlightLog);
    console.log('this.crudFlightLog: ', this.crudFlightLog);
    switch (this.crudMode) {
        case CrudEnum.ADD:
            this.clearTimePortionOfDates(this.crudFlightLog);
            this.flightLogService.addFlightLog(this.crudFlightLog).subscribe({
                next: savedFlightLog => {
                    console.log('savedFlightLog', savedFlightLog);
                },
                // error: error => {
                //     console.error('flightLogService.saveFlightLog() returned error: ', error);
                //     //this.messageService.error(error);
                // },
                complete: () => {
                    this.afterCrud();
                }
            });
            break;
        case CrudEnum.UPDATE:
            this.clearTimePortionOfDates(this.crudFlightLog);
            this.flightLogService.updateFlightLog(this.crudFlightLog).subscribe({
                next: savedFlightLog => {
                    console.log('updatedFlightLog', savedFlightLog);
                },
                // error: error => {
                //     console.error('flightLogService.updateFlightLog() returned error: ', error);
                //     //this.messageService.error(error);
                // },
                complete: () => {
                    this.afterCrud();
                }
            });
            break;
        case CrudEnum.DELETE:
            console.log('this.crudFlightLog: ', this.crudFlightLog);
            this.flightLogService.deleteFlightLog(this.crudFlightLog).subscribe({
                next: savedFlightLog => {
                    console.log('deleted flightLog', this.crudFlightLog);
                },
                // error: error => {
                //     console.error('flightLogService.saveFlightLog() returned error: ', error);
                //     //this.messageService.error(error);
                // },
                complete: () => {
                    this.afterCrud();
                }
            });
            break;
        default:
            console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
    }

*/


}

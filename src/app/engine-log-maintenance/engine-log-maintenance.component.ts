import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableEditCompleteEvent, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CrudEnum } from '../crud-enum';
import { EngineLog } from '../domain/EngineLog';
import { HalResponseLinks } from '../response/hal/hal-response-links';
import { HalResponsePage } from '../response/hal/hal-response-page';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { RestService } from '../service/rest.service';
import { SessionService } from '../service/session.service';
import { EngineLogRequest } from '../request/engine-log-request';
import { EngineLogResponse } from '../response/EngineLogResponse';

@Component({
    selector: 'app-engine-log-maintenance',
    imports: [CommonModule, TableModule, FormsModule],
    templateUrl: './engine-log-maintenance.component.html',
    styleUrl: './engine-log-maintenance.component.css'
})
export class EngineLogMaintenanceComponent {

    readonly AC_REGISTRATION: string = 'C-GQGD'
    readonly TABLE_NAME: string = 'engine_log'

    page: HalResponsePage = {} as HalResponsePage;
    links: HalResponseLinks = {} as HalResponseLinks;
    readonly ROWS_PER_PAGE: number = 10; // default rows per page
    firstRowOfTable!: number; // triggers a page change, zero based. 0 -> first page, 1 -> second page, ...
    pageNumber: number = 0;
    engineLogArray!: Array<EngineLog>;
    selectedEngineLog!: EngineLog
    crudMode!: CrudEnum;
    crudEnum = CrudEnum; // Used in html to refere to enum
    modifyAndDeleteButtonsDisable: boolean = true;
    displayDialog: boolean = false
    loadingStatus!: boolean;

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
        //this.savedTableLazyLoadEvent = lazyLoadEvent;
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
                    next: (engineLogResponse: EngineLogResponse) => {
                        console.log('engineLogResponse', engineLogResponse);
                        this.engineLogArray = engineLogResponse._embedded.simpleModels || new Array<EngineLog>

                        this.page = engineLogResponse.page;
                        this.firstRowOfTable = this.page.number * this.ROWS_PER_PAGE;
                        this.links = engineLogResponse._links;
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


    onCommentEditComplete(event: TableEditCompleteEvent) {
        console.log('event', event)
        console.log('event.index', event.index)
        console.log('will need to update', this.engineLogArray[event.index!])
        const engineLog: EngineLog = this.engineLogArray[event.index!]

        const engineLogRequest: EngineLogRequest = {
            id: engineLog.id,
            comment: engineLog.comment
        }
        this.restService.updateEngineLog(engineLogRequest)
            .subscribe(
                {
                    next: (response: any) => {
                        console.log('response', response)
                    },
                    complete: () => {
                        console.log('http request completed')
                        //this.messageService.add({ severity: 'info', summary: '200', detail: 'Updated successfully' });

                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        console.log('httpErrorResponse', httpErrorResponse)
                    }
                });

    }


}

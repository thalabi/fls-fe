import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TableEditCompleteEvent, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CrudEnum } from '../crud-enum';
import { FuelPrice } from '../domain/FuelPrice';
import { HalResponseLinks } from '../response/hal/hal-response-links';
import { HalResponsePage } from '../response/hal/hal-response-page';
import { RestService } from '../service/rest.service';
import { SessionService } from '../service/session.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FuelPriceRequest } from '../request/fuel-price-request';
import { FuelPriceResponse } from '../response/FuelPriceResponse';

@Component({
    selector: 'app-fuel-price-maintenance',
    imports: [CommonModule, TableModule, FormsModule, TooltipModule],
    templateUrl: './fuel-price-maintenance.component.html',
    styleUrl: './fuel-price-maintenance.component.css'
})
export class FuelPriceMaintenanceComponent implements OnInit {

    readonly TABLE_NAME: string = 'fuel_price'

    page: HalResponsePage = {} as HalResponsePage;
    links: HalResponseLinks = {} as HalResponseLinks;
    readonly ROWS_PER_PAGE: number = 10; // default rows per page
    firstRowOfTable!: number; // triggers a page change, zero based. 0 -> first page, 1 -> second page, ...
    pageNumber: number = 0;
    fuelPriceArray!: Array<FuelPrice>;
    selectedFuelPrice!: FuelPrice
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
        this.restService.getTableData(this.TABLE_NAME, searchCriteria, pageNumber, pageSize, ['date'])
            .subscribe(
                {
                    next: (fuelPriceResponse: FuelPriceResponse) => {
                        console.log('fuelPriceResponse', fuelPriceResponse);
                        this.fuelPriceArray = fuelPriceResponse._embedded.simpleModels || new Array<FuelPrice>

                        this.page = fuelPriceResponse.page;
                        this.firstRowOfTable = this.page.number * this.ROWS_PER_PAGE;
                        this.links = fuelPriceResponse._links;
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
        console.log('will need to update', this.fuelPriceArray[event.index!])
        const fuelPrice: FuelPrice = this.fuelPriceArray[event.index!]

        const fuelPriceRequest: FuelPriceRequest = {
            id: fuelPrice.id,
            comment: fuelPrice.comment
        }
        this.restService.updateFuelPrice(fuelPriceRequest)
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

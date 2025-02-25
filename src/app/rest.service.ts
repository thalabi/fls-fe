import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { IGenericEntity } from './domain/i-gerneric-entity';
import { IGenericEntityResponse } from './response/i-generic-entity-response';

@Injectable({
    providedIn: 'root'
})
export class RestService {
    readonly serviceUrl: string;

    constructor(
        private httpClient: HttpClient
    ) {
        this.serviceUrl = environment.beRestServiceUrl;
    }

    getTableData(tableName: string, searchCriteria: string, pageNumber: number, pageSize: number, sortColumns?: Array<string>, projection?: string): Observable<any> {
        searchCriteria = encodeURIComponent(searchCriteria)
        let sortQueryParams: string = ''
        if (sortColumns) {
            console.log('sortColumns', sortColumns)
            sortColumns.forEach(sortColumnAndDirection => {
                sortQueryParams = sortQueryParams + "&sort=" + sortColumnAndDirection
            })
            console.log('sortQueryParams', sortQueryParams)
        }
        const projectionParam: string = projection ? `&projection=${projection}` : ''

        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        console.log('entityNameResource', entityNameResource)
        return this.httpClient.get(this.serviceUrl + '/protected/genericEntityController/findAll?' + 'tableName=' + tableName + '&search=' + searchCriteria + '&page=' + pageNumber + '&size=' + pageSize + sortQueryParams + projectionParam)
    }

    updateGenericEntity(row: IGenericEntity): Observable<IGenericEntityResponse> {
        console.log('row: ', row);

        let url: string = row._links.self.href;
        console.log('url: ', url);
        return this.httpClient.patch<IGenericEntity>(url, row).pipe(
            map((response: any) => {
                console.log('response', response);
                return response;
            }),
            catchError((httpErrorResponse: HttpErrorResponse) => {
                console.log('httpErrorResponse', httpErrorResponse);
                RestService.handleError(httpErrorResponse);
                return throwError(() => new Error());
            }));
    }

    public static toCamelCase(tableName: string): string {
        return tableName.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()); // convert to camel case
    }

    public static toPlural(entityName: string): string {
        return entityName.endsWith('s') ? entityName + 'es' : entityName + 's'
    }
    public static handleError(httpErrorResponse: HttpErrorResponse) {
        console.error('An error occurred. See blow info.');
        console.error('httpErrorResponse', httpErrorResponse);
        console.error('httpErrorResponse.error', httpErrorResponse.error);
        console.error('httpErrorResponse.headers', httpErrorResponse.headers);
        console.error('httpErrorResponse.message', httpErrorResponse.message);
        console.error('httpErrorResponse.name', httpErrorResponse.name);
        console.error('httpErrorResponse.ok', httpErrorResponse.ok);
        console.error('httpErrorResponse.status', httpErrorResponse.status);
        console.error('httpErrorResponse.statusText', httpErrorResponse.statusText);
        console.error('httpErrorResponse.type', httpErrorResponse.type);
        console.error('httpErrorResponse.url', httpErrorResponse.url);
    }

}

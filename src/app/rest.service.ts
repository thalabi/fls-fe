import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

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

    public static toCamelCase(tableName: string): string {
        return tableName.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()); // convert to camel case
    }

    public static toPlural(entityName: string): string {
        return entityName.endsWith('s') ? entityName + 'es' : entityName + 's'
    }

}

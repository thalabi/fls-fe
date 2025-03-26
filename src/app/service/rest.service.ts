import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { IGenericEntity } from '../domain/i-gerneric-entity';
import { FuelLog } from '../domain/FuelLog';
import { AcParameters } from '../domain/AcParameters';
import { LogSheetRequest } from '../request/log-sheet-request';
import { LogSheet } from '../domain/LogSheet';
import { LogSheetAndFuelLogRequest } from '../request/log-sheet-and-fuel-log-request';
import { JourneyLogRequest } from '../request/journey-log-request';
import { EngineLogRequest } from '../request/engine-log-request';

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
        return this.httpClient.get(`${this.serviceUrl}/protected/genericEntityController/findAll?tableName=${tableName}&search=${searchCriteria}&page=${pageNumber}&size=${pageSize}${sortQueryParams}${projectionParam}`)
    }
    getRecordCount(tableName: string): Observable<any> {
        return this.httpClient.get(`${this.serviceUrl}/protected/genericEntityController/countAll?tableName=${tableName}`);
    }
    updateAcParameters(acParameters: AcParameters): Observable<HttpResponse<any>> {
        return this.httpClient.put<HttpResponse<any>>(`${this.serviceUrl}/protected/data-rest/acParameterses/${acParameters.id}`, acParameters);
    }

    getLastFuelLog(registration: string): Observable<any> {
        return this.httpClient.get(`${this.serviceUrl}/protected/data-rest/fuelLogs/search/findTopByRegistrationOrderByDateDesc?registration=${registration}`);
    }
    addFuelLog(fuelLog: FuelLog): Observable<HttpResponse<any>> {
        return this.httpClient.post<HttpResponse<any>>(`${this.serviceUrl}/protected/data-rest/fuelLogs`, fuelLog);
    }
    updateFuelLog(fuelLog: FuelLog): Observable<HttpResponse<any>> {
        return this.httpClient.put<HttpResponse<any>>(`${this.serviceUrl}/protected/data-rest/fuelLogs/${fuelLog.id}`, fuelLog);
    }
    deleteFuelLog(id: number): Observable<HttpResponse<any>> {
        return this.httpClient.delete<HttpResponse<any>>(`${this.serviceUrl}/protected/data-rest/fuelLogs/${id}`);
    }

    addLogSheetAndFuelLog(logSheetAndFuelLogRequest: LogSheetAndFuelLogRequest): Observable<HttpResponse<any>> {
        return this.httpClient.post<HttpResponse<any>>(`${this.serviceUrl}/protected/logSheetController/addLogSheetAndFuelLog`, logSheetAndFuelLogRequest);
    }


    addLogSheet(logSheetRequest: LogSheetRequest): Observable<HttpResponse<any>> {
        return this.httpClient.post<HttpResponse<any>>(`${this.serviceUrl}/protected/logSheetController/addLogSheet`, logSheetRequest);
    }
    updateLogSheet(logSheetRequest: LogSheetRequest): Observable<HttpResponse<any>> {
        return this.httpClient.post<HttpResponse<any>>(`${this.serviceUrl}/protected/logSheetController/updateLogSheet`, logSheetRequest);
    }
    deleteLogSheet(logSheetRequest: LogSheetRequest): Observable<HttpResponse<any>> {
        return this.httpClient.post<HttpResponse<any>>(`${this.serviceUrl}/protected/logSheetController/deleteLogSheet`, logSheetRequest);
    }

    updateJourneyLog(journeyLogRequest: JourneyLogRequest): Observable<HttpResponse<any>> {
        return this.httpClient.patch<HttpResponse<any>>(`${this.serviceUrl}/protected/data-rest/journeyLogs/${journeyLogRequest.id}`, journeyLogRequest);
    }
    updateEngineLog(engineLogRequest: EngineLogRequest): Observable<HttpResponse<any>> {
        return this.httpClient.patch<HttpResponse<any>>(`${this.serviceUrl}/protected/data-rest/engineLogs/${engineLogRequest.id}`, engineLogRequest);
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

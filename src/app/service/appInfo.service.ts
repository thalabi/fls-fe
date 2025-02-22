import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppInfoService {
    readonly serviceUrl: string;

    constructor(
        private http: HttpClient,
    ) {
        this.serviceUrl = environment.beRestServiceUrl;
    }

    getBuildInfo(): Observable<string> {
        return this.http.get(this.serviceUrl + '/appInfoController/getBuildInfo', { responseType: "text" });
    }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { UserInfo } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthRestService {

    constructor(private http: HttpClient) { }

    getUserInfo(): Observable<UserInfo> {
        console.log('getUserInfo')
        return this.http.get<UserInfo>(environment.beRestServiceUrl + '/protected/securityController/getUserInfo');
    }

}

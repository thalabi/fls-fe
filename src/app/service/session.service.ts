import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { AuthService, UserInfo } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    private userInfoSource = new BehaviorSubject<UserInfo>({} as UserInfo);
    public userInfo$ = this.userInfoSource.asObservable();

    private disableParentMessagesSource = new BehaviorSubject<boolean>(false)
    public disableParentMessages$ = this.disableParentMessagesSource.asObservable()

    private backendExceptionstackTraceSource = new BehaviorSubject<string>('')
    public backendExceptionstackTrace$ = this.backendExceptionstackTraceSource.asObservable()

    constructor(private authService: AuthService) {
        this.authService.isAuthenticated$
            .pipe(distinctUntilChanged())
            .subscribe(authenticated => {
                console.log('authenticated', authenticated)
                if (authenticated) {
                    this.authService.getUserInfo().subscribe((userInfo: UserInfo) => {
                        console.log('userInfo', userInfo)
                        this.userInfoSource.next(userInfo)
                    })
                }
            })
    }

    setDisableParentMessages(disableParentMessages: boolean) {
        this.disableParentMessagesSource.next(disableParentMessages)
    }

    setBackendExceptionstackTrace(backendExceptionstackTrace: string) {
        this.backendExceptionstackTraceSource.next(backendExceptionstackTrace)
    }
    clearBackendStackTrace() {
        this.backendExceptionstackTraceSource.next('')
    }

}

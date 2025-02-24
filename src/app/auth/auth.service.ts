import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable, combineLatest, filter, map, of, tap } from 'rxjs';
import { AuthRestService } from './auth-rest.service';
import { authCodeFlowConfig } from './auth-config';


export interface UserInfo { username: string, firstName: string, lastName: string, email: string, roles: Array<String>, backEndAuthorities: Array<String> }

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    ssoLogoutMessage = 'Session ended. Please login again'
    abnormalLogoutMessage = 'Something went wrong. Session ended'

    // test begin
    private oAuthEventArraySubject$ = new BehaviorSubject<string[]>([]);
    public oAuthEventArray$ = this.oAuthEventArraySubject$.asObservable();

    // test end

    private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

    private isDoneLoadingSubject$ = new BehaviorSubject<boolean>(false);
    public isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();

    /**
     * Publishes `true` if and only if (a) all the asynchronous initial
     * login calls have completed or errorred, and (b) the user ended up
     * being authenticated.
     *
     * In essence, it combines:
     *
     * - the latest known state of whether the user is authorized
     * - whether the ajax calls for initial log in have all been done
     */
    public canActivateProtectedRoutes$: Observable<boolean> = combineLatest([
        this.isAuthenticated$,
        this.isDoneLoading$
    ]).pipe(
        //tap(values => console.log('combineLatest from this.isAuthenticated$ and this.isDoneLoading$', values)),
        map(values => values.every(b => b))
    );

    public isLoggedIn(): boolean {
        return this.oauthService.hasValidIdToken() && this.oauthService.hasValidAccessToken()

    }
    constructor(private oauthService: OAuthService, private router: Router, private authRestService: AuthRestService) {
        console.log('constructor')

        let oAuthEventArray: string[] = [];
        // refresh access token after 75% of the token's life time is over
        this.oauthService.events.subscribe(({ type: oAuthEvent }: OAuthEvent) => {

            //console.log('this.oauthService.hasValidAccessToken()', this.oauthService.hasValidAccessToken())
            //console.log('this.isAuthenticatedSubject$.next(', this.oauthService.hasValidAccessToken(), ')')
            this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());

            if (oAuthEvent !== 'session_unchanged') {
                console.log('oAuthEvent:', oAuthEvent)
                //console.log('hasValidIdToken', this.oauthService.hasValidIdToken())
                // test begin
                oAuthEventArray.push(oAuthEvent + ' at ' + (new Date()).toLocaleTimeString())
                console.log('oAuthEventArray', oAuthEventArray)
                new Date()
                this.oAuthEventArraySubject$.next(oAuthEventArray)
                // test end
            }
            //this.oAuthEventMessage = new Date().toTimeString().slice(3, 8) + " " + oAuthEvent
            switch (oAuthEvent) {
                case 'token_received': {
                    const expirationDate = new Date(this.oauthService.getAccessTokenExpiration())
                    const expirationTime = expirationDate.toTimeString().slice(0, 8)
                    let refreshDate = new Date(expirationDate)
                    refreshDate.setSeconds(expirationDate.getSeconds() - 75) // 75% of 5 minutes is 225 seconds. subtract 225 from 300 is 75
                    const refreshTime = refreshDate.toTimeString().slice(0, 8)
                    console.log('access token will expire at: %s, will refresh at: %s', expirationTime, refreshTime)
                    break
                }
                // when user logs out from another window and revokes the token
                // logout due to token revoked by another sign on
                case 'token_refresh_error': {
                    console.log('about to logout user due to token_refresh_error')
                    this.logout(this.ssoLogoutMessage)
                    break
                }
                case 'jwks_load_error':
                case 'invalid_nonce_in_state':
                case 'discovery_document_load_error':
                case 'discovery_document_validation_error':
                case 'user_profile_load_error':
                case 'token_error':
                case 'code_error':
                case 'silent_refresh_error':
                case 'silent_refresh_timeout':
                case 'token_validation_error':
                case 'token_revoke_error':
                case 'session_error':
                case 'popup_blocked':
                    this.logout(this.abnormalLogoutMessage + ' (oAuthEvent: ' + oAuthEvent + ')')
                    break
                case 'session_changed':
                case 'session_terminated':
                default: {
                    break
                }
            }
        })
    }

    runInitialLoginSequence(): Promise<void> {
        console.log('runInitialLoginSequence')
        //this.oauthService.tokenValidationHandler = new JwksValidationHandler();

        this.oauthService.setupAutomaticSilentRefresh();

        this.oauthService.configure(authCodeFlowConfig);


        return this.oauthService.loadDiscoveryDocumentAndTryLogin()
            // For demo purposes, we pretend the previous call was very slow
            //.then(() => new Promise<void>(resolve => setTimeout(() => resolve(), 3000)))

            // .then(() => {
            //     console.log('then()')
            //     console.log('this.isDoneLoadingSubject$.next(true)')
            //     this.isDoneLoadingSubject$.next(true)
            // })
            .then(() => {

                console.log('then()')
                console.log('this.isDoneLoadingSubject$.next(true)')
                this.isDoneLoadingSubject$.next(true)

                if (this.oauthService.hasValidIdToken() && this.oauthService.hasValidAccessToken()) {
                    console.log("logged in");

                    const username: string = this.getUsername()
                    console.log('username:', username)

                    // dynamic routing based on username
                    if (username === 'sso2user1') {
                        this.router.navigate(['/ping-be']);
                    }
                }
            })
            .catch((error) => {
                console.log('catch(), error:', error)
                console.log('this.isDoneLoadingSubject$.next(true)')
                this.isDoneLoadingSubject$.next(true)
            })
    }

    login() {
        console.log('authService.login()')
        this.oauthService.initLoginFlow()
    }

    logout(logoutMessage?: string) {
        console.log('logoutMessage', logoutMessage)
        console.log('this.oauthService.clientId', this.oauthService.clientId)
        console.log('this.oauthService.redirectUri', this.oauthService.redirectUri)
        if (logoutMessage) {
            this.oauthService.revokeTokenAndLogout(
                {
                    client_id: this.oauthService.clientId,
                    post_logout_redirect_uri: this.oauthService.redirectUri + '?logoutMessage=' + logoutMessage
                }
            )
        } else {
            this.oauthService.revokeTokenAndLogout()
        }
    }

    getUserInfo(): Observable<UserInfo> {
        if (this.oauthService.hasValidIdToken() && this.oauthService.hasValidAccessToken()) {
            return this.authRestService.getUserInfo()
        } else {
            return of({} as UserInfo)
        }
    }
    private getUsername(): string {
        const userClaims: any = this.oauthService.getIdentityClaims()
        console.log('userClaims:', userClaims)
        return userClaims?.preferred_username || "no username"
    }

}

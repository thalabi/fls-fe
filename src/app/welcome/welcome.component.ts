import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { SessionService } from '../service/session.service';
import { UserInfo } from '../auth/auth.service';

@Component({
    selector: 'app-welcome',
    imports: [NgIf],
    templateUrl: './welcome.component.html',
    styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit {

    authenticated: boolean = false;
    logoutMessage: string = '';
    userInfo: UserInfo = {} as UserInfo;

    constructor(
        private activatedRoute: ActivatedRoute,
        private sessionService: SessionService
    ) { }

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(queryParams => {
            this.logoutMessage = queryParams['logoutMessage']
            console.log('logoutMessage:', this.logoutMessage)
        })

        this.sessionService.userInfo$
            // In case the userInfo has not been set
            .pipe(filter(userInfo => Object.keys(userInfo).length !== 0))
            .subscribe(userInfo => {
                console.log('userInfo', userInfo);
                this.authenticated = true;
                this.userInfo = userInfo
            })
    }

}

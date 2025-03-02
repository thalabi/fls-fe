import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { distinctUntilChanged } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { SessionService } from '../service/session.service';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-menu',
    imports: [MenubarModule],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
    items: Array<MenuItem> = {} as Array<MenuItem>

    constructor(
        private authService: AuthService,
        private sessionService: SessionService
    ) { }

    ngOnInit(): void {

        console.log('menu component')
        const userMenuItems = [
            {
                label: 'Log Sheet', routerLink: ['/log-sheet']
            },
            {
                label: 'Refuel', routerLink: ['/refuel']
            },
            {
                label: 'Maintenance',
                items: [
                    { label: 'Fuel Log Maintenance', routerLink: ['/fuel-log'] },
                    { label: 'A/C Parameters', routerLink: ['/ac-parameters'] }
                ]
            },
            // {
            //     label: 'Portfolio Management', routerLink: ['/portfolio/portfolioManagement']
            // },
            {
                icon: 'pi pi-user',
                items: [
                    { label: 'Password', url: environment.keycloak.issuer + '/account/#/security/signingin' },
                    { label: 'Logout', command: () => this.logout() },

                ]
            },
        ]

        const adminMenuItems = [...userMenuItems]
        adminMenuItems.push({ label: 'Ping', routerLink: ['/ping'] })

        this.authService.isAuthenticated$
            .pipe(distinctUntilChanged())
            .subscribe(authenticated => {
                console.log('authenticated', authenticated)
                if (authenticated) {
                    this.items = userMenuItems
                    this.sessionService.userInfo$.subscribe(userInfo => {
                        console.log('userInfo', userInfo)
                        console.log('userInfo.backEndAuthorities', userInfo.backEndAuthorities)
                        if (userInfo.backEndAuthorities?.includes('ROLE_realm_ipm-admin-role')) {
                            this.items = adminMenuItems
                        }
                    })
                } else {
                    this.items = [
                        { label: 'Login', command: () => this.login() }
                    ];
                }
            })
    }

    login() {
        this.authService.login()
    }

    logout() {
        this.authService.logout();
    }



}

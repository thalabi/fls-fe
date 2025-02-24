import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import MyPreset from './mypreset';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideNgIdle } from '@ng-idle/core';
import { authAppInitializerFactory } from './auth/auth-app-initializer.factory';
import { AuthService } from './auth/auth.service';
import { environment } from '../environments/environment';
import { httpErrorInterceptor3 } from './http-error-interceptor-3';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),

        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: MyPreset,
                options: {
                    darkModeSelector: '.my-app-dark'
                }
            }
        }),

        provideHttpClient(

            // DI-based interceptors must be explicitly enabled for HttpErrorInterceptor below to work
            withInterceptorsFromDi(),
            withInterceptors([httpErrorInterceptor3]),
        ),

        // for auth module
        provideOAuthClient({
            resourceServer: {
                allowedUrls: environment.keycloak.urlPrefixesWithBearerToken,
                sendAccessToken: true
            }
        }),
        provideAppInitializer(() => {
            const authService = inject(AuthService);
            return authAppInitializerFactory(authService)();
        }),


        // for ng idle
        provideNgIdle(),
        //
    ]
};

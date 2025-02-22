import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import MyPreset from './mypreset';
import { provideHttpClient } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideNgIdle } from '@ng-idle/core';
import { authAppInitializerFactory } from './auth/auth-app-initializer.factory';
import { AuthService } from './auth/auth.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),

        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: MyPreset,
                options: {
                    darkModeSelector: '.my-app-dark'
                }
            }
        }),
        // for auth module
        provideHttpClient(),
        provideOAuthClient(),
        // for ng idle
        provideNgIdle(),
        //
        provideAppInitializer(() => {
            const authService = inject(AuthService);
            return authAppInitializerFactory(authService)();
        })

    ]
};

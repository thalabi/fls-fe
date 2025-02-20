import { AuthService } from './auth.service';

export function authAppInitializerFactory(authService: AuthService): () => Promise<void> {
    console.log('authAppInitializerFactory')
    return () => authService.runInitialLoginSequence();
}

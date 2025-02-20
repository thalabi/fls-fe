import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

export const authCodeFlowConfig: AuthConfig = {
    // Url of the Identity Provider
    issuer: environment.keycloak.issuer,

    // URL of the SPA to redirect the user to after login
    redirectUri: window.location.origin,

    // The SPA's id. The SPA is registerd with this id at the auth-server
    // clientId: 'server.code',
    clientId: environment.keycloak.clientId,

    // Just needed if your auth server demands a secret. In general, this
    // is a sign that the auth server is not configured with SPAs in mind
    // and it might not enforce further best practices vital for security
    // such applications.
    // dummyClientSecret: 'secret',

    // code flow + PKCE
    responseType: 'code',

    // set the scope for the permissions the client should request
    // The first four are defined by OIDC.
    // Important: Request offline_access to get a refresh token
    // The api scope is a usecase specific one

    // offline_access is required to request a new access token before it's expiry
    scope: "openid profile email",

    requireHttps: environment.keycloak.requireHttps,
    // enable session_terminated events 
    sessionChecksEnabled: true,

    showDebugInformation: true, // Also requires enabling "Verbose" level in devtools
};
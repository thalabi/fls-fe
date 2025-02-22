export const environment = {
    production: false,

    buildVersion: "@buildVersion@",
    buildTimestamp: "@buildTimestamp@",
    beRestServiceUrl: "https://localhost:8443",
    // when adding or changing keycloak json, update auth-config.ts and auth-module-config.ts as well
    keycloak: {
        issuer: 'https://localhost:8083/realms/fls',
        clientId: 'fls',
        requireHttps: true,

        // prefixes of urls to send with Bearer token
        // prefixes have to be in lowerr case
        urlPrefixesWithBearerToken: ['https://localhost:8443/protected']
    },
    idle: {
        // times are in seconds
        inactivityTimer: '299',
        timeoutTimer: '1'
    }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


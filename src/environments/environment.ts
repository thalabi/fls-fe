export const environment = {
    production: false,

    buildVersion: "",
    buildTimestamp: "",
    beRestServiceUrl: "",
    // when adding or changing keycloak json, update auth-config.ts and auth-module-config.ts as well
    keycloak: {
        issuer: '',
        clientId: '',
        requireHttps: true,

        // prefixes of urls to send with Bearer token
        // prefixes have to be in lowerr case
        urlPrefixesWithBearerToken: ['']
    },
    idle: {
        // times are in seconds
        inactivityTimer: '',
        timeoutTimer: ''
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


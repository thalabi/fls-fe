export const environment = {
    production: true,

    buildVersion: "@buildVersion@",
    buildTimestamp: "@buildTimestamp@",
    beRestServiceUrl: "@beRestServiceUrl@",
    // when adding or changing keycloak json, update auth-config.ts and auth-module-config.ts as well
    keycloak: {
        issuer: '@keycloak_issuer@',
        clientId: '@keycloak_clientId@',
        requireHttps: true,

        // prefixes of urls to send with Bearer token
        // prefixes have to be in lowerr case
        urlPrefixesWithBearerToken: ['@keycloak_urlPrefixesWithBearerToken@']
    },
    idle: {
        // times are in seconds
        inactivityTimer: '@idle_inactivityTimer@',
        timeoutTimer: '@idle_timeoutTimer@'
    }

};


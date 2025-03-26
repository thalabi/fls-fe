export interface LogSheet {
    id: number;
    registration: string;
    date: Date;
    from: string;
    to: string;
    airtime: number;
    flightTime: number;
    version: number; // result returned by custom queries use this field
    rowVersion: number; // result returned by JPA Data Rest uses this field
    _links: {
        self: {
            href: URL
        },
        logSheet: {
            href: URL
        }
    };
}
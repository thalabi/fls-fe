export interface JourneyLogV {
    id: number;
    registration: string;
    date: Date;
    from: string;
    to: string;
    takeoffTime: Date;
    landingTime: Date;
    airtime: number;
    comment: string;
    tsn: number;
    version: number; // result returned by custom queries use this field
    rowVersion: number; // result returned by JPA Data Rest uses this field
    _links: {
        self: {
            href: URL
        },
        journeyLogV: {
            href: URL
        }
    };
}
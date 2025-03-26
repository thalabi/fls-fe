export interface EngineLog {
    id: number;
    registration: string;
    date: Date;
    airtime: number;
    comment: string;
    version: number; // result returned by custom queries use this field
    rowVersion: number; // result returned by JPA Data Rest uses this field
    _links: {
        self: {
            href: URL
        },
        engineLog: {
            href: URL
        }
    };
}
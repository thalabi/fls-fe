export interface EngineLogV {
    id: number;
    registration: string;
    date: Date;
    airtime: number;
    comment: string;
    tsmoh: number;
    version: number; // result returned by custom queries use this field
    rowVersion: number; // result returned by JPA Data Rest uses this field
    _links: {
        self: {
            href: URL
        },
        engineLogV: {
            href: URL
        }
    };
}
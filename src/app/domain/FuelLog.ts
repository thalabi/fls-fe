export interface FuelLog {
    id: number;
    registration: string;
    date: Date;
    left: number;
    right: number;
    changeInLeft: number;
    changeInRight: number;
    pricePerLitre: number | null;
    airport: string | null;
    fbo: string | null;
    comment: string | null;
    version: number; // result returned by custom queries use this field
    rowVersion: number; // result returned by JPA Data Rest uses this field
    _links: {
        self: {
            href: URL
        },
        fuelLog: {
            href: URL
        }
    };
}
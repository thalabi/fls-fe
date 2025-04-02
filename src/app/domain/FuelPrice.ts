export interface FuelPrice {
    id: number;
    airport: string;
    fbo: string | null;
    date: Date;
    pricePerLitre: number | null;
    comment: string | null;
    version: number; // result returned by custom queries use this field
    rowVersion: number; // result returned by JPA Data Rest uses this field
    _links: {
        self: {
            href: URL
        },
        fuelPrice: {
            href: URL
        }
    };
}
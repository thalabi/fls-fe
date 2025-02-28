export interface AcParameters {
    id: number;
    registration: string;
    initialTsn: number;
    initialTsmoh: number;
    eachTankCapacity: number;
    fuelBurnPerHour: number;
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
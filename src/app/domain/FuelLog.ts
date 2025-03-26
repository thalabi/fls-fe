export enum FuelTransactionTypeEnum {
    REFUEL = 'Refuel', FLIGHT = 'Flight'
}
export function getFuelTransactionTypeEnum(value: string): FuelTransactionTypeEnum | undefined {
    return (Object.keys(FuelTransactionTypeEnum) as Array<keyof typeof FuelTransactionTypeEnum>)
        .find((key) => FuelTransactionTypeEnum[key] === value) as FuelTransactionTypeEnum | undefined;
}

export interface FuelLog {
    id: number;
    registration: string;
    date: Date;
    transactionType: FuelTransactionTypeEnum;
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
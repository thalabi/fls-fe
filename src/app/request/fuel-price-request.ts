import { FuelTransactionTypeEnum } from "../domain/FuelLog";

export interface FuelPriceRequest {
    id?: number
    // airport: string
    // fbo: string | null
    // date: Date
    // pricePerLitre: number
    comment: string | null
}
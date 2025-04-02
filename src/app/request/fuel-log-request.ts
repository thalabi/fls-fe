import { FuelTransactionTypeEnum } from "../domain/FuelLog";

export interface FuelLogRequest {
    id?: number
    registration: string
    date: Date
    transactionType: FuelTransactionTypeEnum
    left: number
    right: number
    changeInLeft: number
    changeInRight: number
    pricePerLitre: number | null
    airport: string | null
    fbo: string | null
    comment: string | null
    deleteFuelPrice?: boolean | null
}
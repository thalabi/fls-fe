export interface LogSheetAndFuelLogRequest {
    id?: number
    registration: string
    date: Date
    from: string
    to: string
    airtime: number
    flightTime: number
    leftTankUsed: number
    rightTankUsed: number
}
export interface LogSheetAndFuelLogRequest {
    id?: number
    registration: string
    date: Date
    from: string
    to: string
    takeoffTime: Date
    landingTime: Date
    airtime: number
    flightTime: number
    leftTankUsed: number
    rightTankUsed: number
}
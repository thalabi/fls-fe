export interface LogSheetRequest {
    registration: string
    date: Date
    from: string
    to: string
    airtime: number
    flightTime: number
    leftTankUsed: number
    rightTankUsed: number
}
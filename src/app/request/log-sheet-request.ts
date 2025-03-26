export interface LogSheetRequest {
    id?: number
    registration: string
    date: Date
    from: string
    to: string
    airtime: number
    flightTime: number
    leftTankUsed: number
    rightTankUsed: number
    // updateJourneyLog: boolean // updated journey_log table
    // updateEngineLog: boolean // updated engine_log table
}
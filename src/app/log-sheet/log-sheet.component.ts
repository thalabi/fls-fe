import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    selector: 'app-log-sheet',
    imports: [CommonModule, FluidModule, ReactiveFormsModule, DatePickerModule, ButtonModule, InputNumberModule],
    templateUrl: './log-sheet.component.html',
    styleUrl: './log-sheet.component.css'
})
export class LogSheetComponent implements OnInit {

    timesForm!: FormGroup
    now!: Date
    airtime: number = 0
    flightTime: number = 0
    totalAirtime: number = 0
    tsmoh: number = 0

    fuelForm!: FormGroup

    leftTankFuelPumped!: number // from service
    rightTankFuelPumped!: number // from service

    previousFlightsLeftTankFuelUsed!: number // from service
    previousFlightsRightTankFuelUsed!: number // from service
    previousFlightsBothTanksFuelUsed!: number
    previousFlightsFuelRemaining!: number
    previousFlightsFuelTimeRemaining!: string

    flightLeftTankFuelUsed!: number
    flightRightTankFuelUsed!: number

    totalLeftTankFuelUsed!: number | null
    totalRightTankFuelUsed!: number | null
    totalBothTanksFuelUsed!: number | null

    fuelRemaining!: number
    fuelTimeRemaining!: string

    bothTanksFuelPumped!: number
    flightBothTanksFuelUsed!: number | null

    // a/c parameters
    initialTsn!: number // from service
    initialTsmoh!: number // from service
    eachTankCapacity!: number // from service
    fuelBurnPerHour!: number // from service

    readonly oneDayMinutes: number = 24 * 60;

    constructor(/*private productService: ProductService*/) { }

    ngOnInit() {
        this.initTimesForm()
        this.initFuelForm()

        this.getAircraftParameters()
        this.getFuelBeforeFlight()
    }

    private initTimesForm() {
        this.now = new Date()
        this.timesForm = new FormGroup({
            flightDate: new FormControl<Date>(this.now, Validators.required),
            startupTime: new FormControl<Date>(this.now, Validators.required),
            takeoffTime: new FormControl<Date>(this.now, Validators.required),
            landingTime: new FormControl<Date>(this.now, Validators.required),
            shutdownTime: new FormControl<Date>(this.now, Validators.required),
        });
    }
    private initFuelForm() {
        this.fuelForm = new FormGroup({
            flightLeftTankFuelUsedControl: new FormControl<number | null>(null, Validators.required),
            flightRightTankFuelUsedControl: new FormControl<number | null>(null, Validators.required),
        });
    }

    onSubmitTimesForm() {
        console.log('onSubmit()')
        console.log(this.timesForm.controls['flightDate'].value)
        console.log(this.timesForm.controls['startupTime'].value)
        console.log(this.timesForm.controls['takeoffTime'].value)
        console.log(this.timesForm.controls['landingTime'].value)
        console.log(this.timesForm.controls['shutdownTime'].value)
        if (this.timesForm.controls['flightDate'].value instanceof String) {
            console.log('this.logSheetForm.controls[\'flightDate\'].value is String')
        } else if (this.timesForm.controls['flightDate'].value instanceof Date) {
            console.log('this.logSheetForm.controls[\'flightDate\'].value is Date')
        } else {
            console.log('this.logSheetForm.controls[\'flightDate\'].value is something else')
        }
        console.log(this.timesForm.controls)
        const flightDate: Date = this.timesForm.controls['flightDate'].value

        const startupMinutes: number = Math.floor(this.timesForm.controls['startupTime'].value.getTime() / (60 * 1000))
        let takeoffMinutes: number = Math.floor(this.timesForm.controls['takeoffTime'].value.getTime() / (60 * 1000))
        let landingMinutes: number = Math.floor(this.timesForm.controls['landingTime'].value.getTime() / (60 * 1000))
        let shutdownMinutes: number = Math.floor(this.timesForm.controls['shutdownTime'].value.getTime() / (60 * 1000))
        let times: number[] = [startupMinutes, takeoffMinutes, landingMinutes, shutdownMinutes]
        console.log('before adjust times')
        this.displayTimes(times)
        this.adjustTimes(times)
        console.log('after adjust times')
        this.displayTimes(times)

        const airtimeMinutes: number = times[2] - times[1]
        const flightTimeMinutes: number = times[3] - times[0]
        this.airtime = this.toHours(airtimeMinutes)
        this.flightTime = this.toHours(flightTimeMinutes)
        console.log('airtimeMinutes', airtimeMinutes)
        console.log('airtime', this.airtime)
        console.log('flightTimeMinutes', flightTimeMinutes)
        console.log('flightTime', this.flightTime)

        this.totalAirtime = this.initialTsn + this.airtime
        this.tsmoh = this.initialTsmoh + this.airtime

    }

    onResetTimesForm() {
        console.log('onCancel()')
        // this.resetDialoForm();
        this.initTimesForm()
        this.airtime = 0
        this.flightTime = 0
        this.totalAirtime = this.initialTsn
        this.tsmoh = this.initialTsmoh

        // this.displayDialog = false;
        // this.sessionService.setDisableParentMessages(false)
        // this.modifyAndDeleteButtonsDisable = true
    }

    private adjustTimes(times: number[]) {
        if (times[1] < times[0]) {
            console.log('takeoffMinutes < startupMinutes')
            times[1] += this.oneDayMinutes
            times[2] += this.oneDayMinutes
            times[3] += this.oneDayMinutes
            this.displayTimes(times)
            this.adjustTimes(times)
        } else if (times[2] < times[1]) {
            console.log('landingMinutes < takeoffMinutes')
            times[2] += this.oneDayMinutes
            times[3] += this.oneDayMinutes
            this.displayTimes(times)
            this.adjustTimes(times)
        } else if (times[3] < times[2]) {
            console.log('shutdownMinutes < landingMinutes')
            times[3] += this.oneDayMinutes
            this.displayTimes(times)
            this.adjustTimes(times)
        }
        return
    }
    private displayTimes(times: number[]) {
        console.log('startupMinutes', times[0])
        console.log('takeoffMinutes', times[1])
        console.log('landingMinutes', times[2])
        console.log('shutdownMinutes', times[3])

    }
    private toHours(minutes: number): number {
        return Math.round(minutes / 6) / 10
    }

    onSubmitFuelForm() {
        this.flightLeftTankFuelUsed = this.fuelForm.controls['flightLeftTankFuelUsedControl'].value
        this.flightRightTankFuelUsed = this.fuelForm.controls['flightRightTankFuelUsedControl'].value
        this.flightBothTanksFuelUsed = this.flightLeftTankFuelUsed +
            this.flightRightTankFuelUsed

        this.totalLeftTankFuelUsed = this.previousFlightsLeftTankFuelUsed + this.flightLeftTankFuelUsed
        this.totalRightTankFuelUsed = this.previousFlightsRightTankFuelUsed + this.flightRightTankFuelUsed
        this.totalBothTanksFuelUsed = this.totalLeftTankFuelUsed + this.totalRightTankFuelUsed

        this.fuelRemaining = this.bothTanksFuelPumped - this.totalBothTanksFuelUsed
        this.fuelTimeRemaining = this.toFuelTime(this.fuelRemaining)

        //this.toFuelTime()
    }
    onResetFuelForm() {
        this.initFuelForm()
        this.flightBothTanksFuelUsed = null
        this.totalLeftTankFuelUsed = null
        this.totalRightTankFuelUsed = null
        this.totalBothTanksFuelUsed = null
    }

    private getAircraftParameters() {
        this.initialTsn = 4928.7
        this.initialTsmoh = 3385
        this.eachTankCapacity = 24
        this.fuelBurnPerHour = 9

    }
    private getFuelBeforeFlight() {
        this.leftTankFuelPumped = 24
        this.rightTankFuelPumped = 24
        this.bothTanksFuelPumped = this.leftTankFuelPumped + this.rightTankFuelPumped
        this.previousFlightsLeftTankFuelUsed = 2.5
        this.previousFlightsRightTankFuelUsed = 5.1
        this.previousFlightsBothTanksFuelUsed = this.previousFlightsLeftTankFuelUsed + this.previousFlightsRightTankFuelUsed
        this.previousFlightsFuelRemaining = this.bothTanksFuelPumped - this.previousFlightsBothTanksFuelUsed
        this.previousFlightsFuelTimeRemaining = this.toFuelTime(this.previousFlightsFuelRemaining)
    }
    private toFuelTime(gallons: number): string {
        const fuelMinuntes = Math.floor(gallons / this.fuelBurnPerHour * 60)
        const hrs = Math.floor(fuelMinuntes / 60)
        const mins = fuelMinuntes % 60
        const fuelTime = hrs + ':' + (mins < 10 ? '0' + mins : mins)
        return fuelTime
    }
}


import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { RestService } from '../service/rest.service';
import { AcParameters } from '../domain/AcParameters';
import { AcParametersResponse } from '../response/AcParametersResponse';
import { forkJoin } from 'rxjs';
import { FuelLog } from '../domain/FuelLog';
import { FuelLogResponse } from '../response/FuelLogResponse';
import { LogSheetRequest } from '../request/log-sheet-request';

@Component({
    selector: 'app-log-sheet',
    imports: [CommonModule, ReactiveFormsModule, DatePickerModule, ButtonModule, InputNumberModule],
    templateUrl: './log-sheet.component.html',
    styleUrl: './log-sheet.component.css'
})
export class LogSheetComponent implements OnInit {

    readonly AC_REGISTRATION: string = 'C-GQGD'

    //timesForm!: FormGroup
    now!: Date
    airtime: number = 0
    flightTime: number = 0
    tsn: number = 0
    tsmoh: number = 0

    // fuelForm!: FormGroup

    leftTankBefore!: number // from service
    rightTankBefore!: number // from service
    bothTanksBefore!: number

    // leftTankUsed!: number
    // rightTankUsed!: number

    remainingLeftTank!: number | null
    remainingRightTank!: number | null
    remainingInTanks!: number | null

    timeRemainingInTanks!: string

    bothTanksFuelPumped!: number
    bothTanksUsed!: number | null

    acParameters!: AcParameters
    fuelLog!: FuelLog

    readonly oneDayMinutes: number = 24 * 60;

    timesCaculated: boolean = false
    fuelCaculated: boolean = false

    timesForm = new FormGroup({
        flightDate: new FormControl<Date>(new Date(), { nonNullable: true, validators: Validators.required }),
        startupTime: new FormControl<Date>(new Date(), { nonNullable: true, validators: Validators.required }),
        takeoffTime: new FormControl<Date>(new Date(), { nonNullable: true, validators: Validators.required }),
        landingTime: new FormControl<Date>(new Date(), { nonNullable: true, validators: Validators.required }),
        shutdownTime: new FormControl<Date>(new Date(), { nonNullable: true, validators: Validators.required }),
    });

    fuelForm = new FormGroup({
        leftTankUsed: new FormControl<number | null>(null, Validators.required),
        rightTankUsed: new FormControl<number | null>(null, Validators.required),
    });

    leftTankUsed!: number;
    rightTankUsed!: number;

    constructor(private messageService: MessageService, private restService: RestService) { }

    ngOnInit() {
        this.messageService.clear()
        this.initTimesForm()
        this.initFuelForm()

        // this.getAcParameters()
        this.getFuelBeforeFlight()
    }

    private initTimesForm() {
        this.timesForm.reset()
    }
    private initFuelForm() {
        this.fuelForm.reset()
    }

    onSubmitTimesForm() {
        console.log('onSubmit()')
        console.log(this.timesForm.controls.flightDate.value)
        console.log(this.timesForm.controls.startupTime.value)
        console.log(this.timesForm.controls.takeoffTime.value)
        console.log(this.timesForm.controls.landingTime.value)
        console.log(this.timesForm.controls.shutdownTime.value)
        if (this.timesForm.controls.flightDate.value instanceof String) {
            console.log('this.logSheetForm.controls.flightDate.value is String')
        } else if (this.timesForm.controls.flightDate.value instanceof Date) {
            console.log('this.logSheetForm.controls.flightDate.value is Date')
        } else {
            console.log('this.logSheetForm.controls.flightDate.value is something else')
        }
        console.log(this.timesForm.controls)
        const flightDate: Date = this.timesForm.controls.flightDate.value

        const startupMinutes: number = Math.floor(this.timesForm.controls.startupTime.value.getTime() / (60 * 1000))
        let takeoffMinutes: number = Math.floor(this.timesForm.controls.takeoffTime.value.getTime() / (60 * 1000))
        let landingMinutes: number = Math.floor(this.timesForm.controls.landingTime.value.getTime() / (60 * 1000))
        let shutdownMinutes: number = Math.floor(this.timesForm.controls.shutdownTime.value.getTime() / (60 * 1000))
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

        this.tsn = this.acParameters.initialTsn + this.airtime
        this.tsmoh = this.acParameters.initialTsmoh + this.airtime

        this.timesCaculated = true
    }

    onResetTimesForm() {
        console.log('onCancel()')
        this.initTimesForm()
        this.airtime = 0
        this.flightTime = 0
        this.tsn = 0 //this.acParameters.initialTsn
        this.tsmoh = 0 //this.acParameters.initialTsmoh

        this.timesCaculated = false

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
        this.leftTankUsed = this.fuelForm.controls.leftTankUsed.value ?? 0
        this.rightTankUsed = this.fuelForm.controls.rightTankUsed.value ?? 0
        this.bothTanksUsed = this.leftTankUsed + this.rightTankUsed

        this.remainingLeftTank = this.leftTankBefore - this.leftTankUsed
        this.remainingRightTank = this.rightTankBefore - this.rightTankUsed
        this.remainingInTanks = this.remainingLeftTank + this.remainingRightTank


        this.timeRemainingInTanks = this.toFuelTime(this.remainingInTanks)
        this.fuelCaculated = true
    }
    onResetFuelForm() {
        this.initFuelForm()
        this.bothTanksUsed = null
        this.remainingLeftTank = null
        this.remainingRightTank = null
        this.remainingInTanks = null

        this.fuelCaculated = false
    }

    private getFuelBeforeFlight() {
        console.log('before forkJoin')
        forkJoin({

            acParametersResponse: this.restService.getTableData('ac_parameters', `registration|equals|${this.AC_REGISTRATION}`, 0, 1),

            fuelLogResponse: this.restService.getLastFuelLog(this.AC_REGISTRATION)

        }).subscribe(((result: { acParametersResponse: AcParametersResponse; fuelLogResponse: FuelLogResponse }) => {

            console.log('acParametersResponse', result.acParametersResponse);
            const acParametersArray = result.acParametersResponse._embedded.simpleModels || new Array<AcParameters>
            this.acParameters = acParametersArray[0]

            console.log('fuelLogResponse', result.fuelLogResponse);
            const fuelLogs = result.fuelLogResponse._embedded.fuelLogs || new Array<FuelLog>
            this.leftTankBefore = fuelLogs[0].left + fuelLogs[0].changeInLeft
            this.rightTankBefore = fuelLogs[0].right + fuelLogs[0].changeInRight
            this.bothTanksBefore = this.leftTankBefore + this.rightTankBefore

            console.log('fuelLog', this.fuelLog)

            //this.fuelLogToForm = this.fuelLog // will trigger a change detection and populate the form
        }));


    }
    private toFuelTime(gallons: number): string {
        const fuelMinuntes = Math.floor(gallons / this.acParameters.fuelBurnPerHour * 60)
        const hrs = Math.floor(fuelMinuntes / 60)
        const mins = fuelMinuntes % 60
        const fuelTime = hrs + ':' + (mins < 10 ? '0' + mins : mins)
        return fuelTime
    }

    onSave() {
        const logSheetRequest: LogSheetRequest = {
            date: this.timesForm.controls.flightDate.value,
            registration: this.AC_REGISTRATION,
            airtime: this.airtime,
            flightTime: this.flightTime,
            leftTankUsed: this.leftTankUsed,
            rightTankUsed: this.rightTankUsed
        }
        this.restService.addLogSheet(logSheetRequest).subscribe()
    }
}


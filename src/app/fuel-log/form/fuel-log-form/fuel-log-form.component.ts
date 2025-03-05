import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { PriceTypeOptionEnum } from '../../maintenance/fuel-log-maintenance.component';
import { ButtonModule } from 'primeng/button';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { FuelLog } from '../../../domain/FuelLog';
import { AcParameters } from '../../../domain/AcParameters';
import { BehaviorSubject, combineLatest, forkJoin } from 'rxjs';

@Component({
    selector: 'app-fuel-log-form',
    imports: [CommonModule, ReactiveFormsModule, DatePickerModule, CheckboxModule, InputNumberModule, InputTextModule, SelectModule, ButtonModule],
    templateUrl: './fuel-log-form.component.html',
    styleUrl: './fuel-log-form.component.css'
})
export class FuelLogFormComponent implements OnInit {
    private fuelLogSource = new BehaviorSubject<FuelLog>({} as FuelLog)
    private acParametersSource = new BehaviorSubject<AcParameters>({} as AcParameters)

    fuelLog!: FuelLog
    @Input("fuelLog") set inputFuelLog(value: FuelLog) {
        console.log('@Input() set inputFuelLog(value: FuelLog) value: ', value)
        this.fuelLogSource.next(value)
        this.fuelLogSource.subscribe(data => console.log('fuelLogSource data', data))
    }

    acParameters!: AcParameters
    @Input("acParameters") set inputAcParameters(value: AcParameters) {
        console.log('@Input() set inputAcParameters(value: AcParameters) value: ', value)
        this.acParametersSource.next(value)
        this.acParametersSource.subscribe(data => console.log('acParametersSource data', data))
    }

    @Input() maintenanceMode: boolean = false
    @Output() formSubmitted = new EventEmitter<FuelLog>();
    @Output() formCancelled = new EventEmitter();

    priceTypeOptions: Array<PriceTypeOptionEnum> = [PriceTypeOptionEnum.PER_LITRE, PriceTypeOptionEnum.TOTAL]
    pricePerLitre!: number

    formReady: boolean = false
    form = new FormGroup({
        date: new FormControl<Date>(new Date(), { nonNullable: true, validators: Validators.required }),
        left: new FormControl<number>(0),
        right: new FormControl<number>(0),
        topUp: new FormControl<boolean>(false, { nonNullable: true, validators: Validators.required }),
        addToLeftTank: new FormControl<number | null>(null, Validators.required),
        addToRightTank: new FormControl<number | null>(null, Validators.required),
        priceType: new FormControl<PriceTypeOptionEnum>(PriceTypeOptionEnum.PER_LITRE, { nonNullable: true }), // nonNullable: true, means when the form is reset the default value is used
        price: new FormControl<number | null>(null, Validators.required),
        airport: new FormControl<string>('', Validators.required),
        fbo: new FormControl<string>(''),
        comment: new FormControl<string>(''),
    });

    ngOnInit(): void {
        console.log('ngOnInit')

        combineLatest({ // forkJoin doesn't work with BehaviorSubject
            // combineLatest wait for the 'next' value to emitted vs forkJoin which waits for operation to 'complete'

            acParameters: this.acParametersSource,

            fuelLog: this.fuelLogSource

        }).subscribe(((result: { acParameters: AcParameters; fuelLog: FuelLog }) => {

            console.log('subscribe acParameters & fuelLog')

            if (result.acParameters !== undefined && result.fuelLog !== undefined) {
                console.log('result.acParameters', result.acParameters)
                this.acParameters = result.acParameters

                console.log('result.fuelLog', result.fuelLog)
                this.fuelLog = result.fuelLog

                this.fillInFormWithValues()
                this.formReady = true
            }

        }));


    }

    private fillInFormWithValues() {
        console.log('this.fuelLog', this.fuelLog)
        this.form.controls.date.setValue(this.fuelLog.date !== undefined ? new Date(this.fuelLog.date) : new Date())
        this.form.controls.left.setValue(this.fuelLog.left)
        this.form.controls.right.setValue(this.fuelLog.right)
        this.form.controls.topUp.setValue(false)
        this.form.controls.addToLeftTank.setValue(this.fuelLog.changeInLeft)
        this.form.controls.addToRightTank.setValue(this.fuelLog.changeInRight)
        this.form.controls.priceType.setValue(PriceTypeOptionEnum.PER_LITRE)
        this.form.controls.price.setValue(this.fuelLog.pricePerLitre)
        this.form.controls.airport.setValue(this.fuelLog.airport)
        this.form.controls.fbo.setValue(this.fuelLog.fbo)
        this.form.controls.comment.setValue(this.fuelLog.comment)

        this.checkAndDisablePriceTypeAndPrice()

        console.log('this.form.value', this.form.value)
    }

    private fillFuelLogWithValues() {
        console.log('this.form.value', this.form.value)
        this.fuelLog.date = new Date(this.form.controls.date.value)
        this.fuelLog.left = this.form.controls.left.value!
        this.fuelLog.right = this.form.controls.right.value!
        this.fuelLog.changeInLeft = this.form.controls.addToLeftTank.value!
        this.fuelLog.changeInRight = this.form.controls.addToRightTank.value!
        if (this.form.controls.addToLeftTank.value! >= 0 || this.form.controls.addToRightTank.value! >= 0) {
            if (this.pricePerLitre === undefined) {
                this.calculatePricePerLitre()
            }
            this.fuelLog.pricePerLitre = this.pricePerLitre
        } else {
            this.fuelLog.pricePerLitre = null
        }
        this.fuelLog.airport = this.form.controls.airport.value!
        this.fuelLog.fbo = this.form.controls.fbo.value!
        this.fuelLog.comment = this.form.controls.comment.value!
    }
    onChangeTopUp(event: CheckboxChangeEvent) {
        console.log('onChangeTopUp(), event', event)
        if (event.checked) {
            const addToLeftTank = this.acParameters.eachTankCapacity - this.form.controls.left.value!
            this.form.controls.addToLeftTank.setValue(this.round(addToLeftTank, 1))
            const addToRightTank = this.acParameters.eachTankCapacity - this.form.controls.left.value!
            this.form.controls.addToRightTank.setValue(this.round(addToRightTank, 1))
        } else {
            this.form.controls.addToLeftTank.reset()
            this.form.controls.addToRightTank.reset()
        }
    }
    onInputLeft() {
        const calculatedTankCapacity = this.round(this.form.controls.left.value! + this.form.controls.addToLeftTank.value!, 1)
        if (calculatedTankCapacity > this.acParameters.eachTankCapacity) {
            this.form.controls.left.setErrors({ invalid: true })
        }
        this.form.controls.addToLeftTank.setErrors(null)

        this.calculatePricePerLitre()
    }
    onInputRight() {
        const calculatedTankCapacity = this.round(this.form.controls.right.value! + this.form.controls.addToRightTank.value!, 1)
        if (calculatedTankCapacity > this.acParameters.eachTankCapacity) {
            this.form.controls.right.setErrors({ invalid: true })
        }
        this.form.controls.addToRightTank.setErrors(null)

        this.calculatePricePerLitre()
    }
    onInputAddToLeftTank() {
        // turn off Top up checkbox
        this.form.controls.topUp.setValue(false)

        if (this.checkAndDisablePriceTypeAndPrice()) {
            return
        }

        const calculatedTankCapacity = this.round(this.form.controls.left.value! + this.form.controls.addToLeftTank.value!, 1)
        if (calculatedTankCapacity > this.acParameters.eachTankCapacity) {
            this.form.controls.addToLeftTank.setErrors({ invalid: true })
        }
        this.form.controls.left.setErrors(null)

        this.calculatePricePerLitre()
    }
    onInputAddToRightTank() {
        // turn off Top up checkbox
        this.form.controls.topUp.setValue(false)

        if (this.checkAndDisablePriceTypeAndPrice()) {
            return
        }

        const calculatedTankCapacity = this.round(this.form.controls.right.value! + this.form.controls.addToRightTank.value!, 1)
        if (calculatedTankCapacity > this.acParameters.eachTankCapacity) {
            this.form.controls.addToRightTank.setErrors({ invalid: true })
        }
        this.form.controls.right.setErrors(null)

        this.calculatePricePerLitre()
    }
    onInputPrice() {
        this.calculatePricePerLitre()
    }
    onChangePriceType() {
        this.calculatePricePerLitre()
    }

    onSubmit() {
        this.fillFuelLogWithValues()
        console.log('this.fuelLog', this.fuelLog)
        this.formSubmitted.emit(this.fuelLog)
    }

    onCancel() {
        this.formCancelled.emit()
    }

    toUpperCase() {
        const airportControl = this.form.controls.airport
        airportControl.setValue((airportControl.value ?? '').toUpperCase(), { emitEvent: false });
    }

    private calculatePricePerLitre() {
        console.log('this.pricePerLitre', this.pricePerLitre)
        const priceType = this.form.controls.priceType.value
        const price = this.form.controls.price.value
        if (priceType == PriceTypeOptionEnum.PER_LITRE) {
            this.pricePerLitre = price!
        } else {
            const addToLeftTank = this.form.controls.addToLeftTank.value
            const addToRightTank = this.form.controls.addToRightTank.value
            this.pricePerLitre = this.round(price! / ((addToLeftTank! + addToRightTank!) * 3.78), 2)
        }
    }

    private round(value: number, precision: number): number {
        console.log('value', value)
        if (value.toLocaleString() == '-' || value.toLocaleString().endsWith('-')) {
            return 0
        } else {
            return Number(value.toFixed(precision))
        }
    }

    private checkAndDisablePriceTypeAndPrice() {
        // if addToLeftTanks & addToRightTank are negative then the priceType and price
        // controls wont appear and by disabling them the Required validtor wont be in effect
        // and allow the form to be valid
        console.log('this.form.controls.addToLeftTank.value!', this.form.controls.addToLeftTank.value!, 'this.form.controls.addToRightTank.value!', this.form.controls.addToRightTank.value!)
        if (this.form.controls.addToLeftTank.value! < 0 && this.form.controls.addToRightTank.value! < 0) {
            this.form.controls.priceType.disable()
            this.form.controls.price.disable()
            return true
        } else {
            this.form.controls.priceType.enable()
            this.form.controls.price.enable()
            return false
        }
    }
}

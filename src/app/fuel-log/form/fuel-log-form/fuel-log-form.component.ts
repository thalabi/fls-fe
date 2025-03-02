import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { PriceTypeOptionEnum } from '../../maintenance/fuel-log-maintenance.component';
import { ButtonModule } from 'primeng/button';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberInputEvent, InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { FuelLog } from '../../../domain/FuelLog';
import { AcParameters } from '../../../domain/AcParameters';

@Component({
    selector: 'app-fuel-log-form',
    imports: [CommonModule, ReactiveFormsModule, DatePickerModule, CheckboxModule, InputNumberModule, InputTextModule, SelectModule, ButtonModule],
    templateUrl: './fuel-log-form.component.html',
    styleUrl: './fuel-log-form.component.css'
})
export class FuelLogFormComponent implements OnChanges {

    @Input() fuelLog!: FuelLog
    @Input() acParameters!: AcParameters
    @Output() formSubmitted = new EventEmitter<FuelLog>();

    priceTypeOptions: Array<PriceTypeOptionEnum> = [PriceTypeOptionEnum.PER_LITRE, PriceTypeOptionEnum.TOTAL]

    form = new FormGroup({
        date: new FormControl<Date>(new Date(), { nonNullable: true, validators: Validators.required }),
        topUp: new FormControl<boolean>(false, { nonNullable: true, validators: Validators.required }),
        addToLeftTank: new FormControl<number | null>(null, Validators.required),
        addToRightTank: new FormControl<number | null>(null, Validators.required),
        priceType: new FormControl<PriceTypeOptionEnum>(PriceTypeOptionEnum.PER_LITRE, { nonNullable: true }), // nonNullable: true, means when the form is reset the default value is used
        price: new FormControl<number | null>(null, Validators.required),
        airport: new FormControl<string>('', Validators.required),
        fbo: new FormControl<string>(''),
        comment: new FormControl<string>(''),
    });

    ngOnChanges(changes: SimpleChanges): void {
        console.log('ngOnChanges()')
        if (changes['fuelLog']?.currentValue !== undefined) {
            this.fillInFormWithValues()
        }
    }

    private fillInFormWithValues() {
        console.log('this.fuelLog', this.fuelLog)
        this.form.controls.date.setValue(this.fuelLog.date)
        this.form.controls.topUp.setValue(false)
        this.form.controls.addToLeftTank.setValue(this.fuelLog.changeInLeft)
        this.form.controls.addToRightTank.setValue(this.fuelLog.changeInRight)
        this.form.controls.priceType.setValue(PriceTypeOptionEnum.PER_LITRE)
        this.form.controls.price.setValue(this.fuelLog.pricePerLitre)
        this.form.controls.airport.setValue(this.fuelLog.airport)
        this.form.controls.fbo.setValue(this.fuelLog.fbo)
        this.form.controls.comment.setValue(this.fuelLog.comment)
        console.log('this.form.value', this.form.value)
    }

    private fillFuelLogWithValue(): FuelLog {
        console.log('this.form.value', this.form.value)
        let fuelLog: FuelLog = {} as FuelLog
        fuelLog.date = new Date(this.form.controls.date.value)
        fuelLog.left = this.fuelLog.left
        fuelLog.right = this.fuelLog.right
        fuelLog.changeInLeft = this.form.controls.addToLeftTank.value!
        fuelLog.changeInRight = this.form.controls.addToRightTank.value!
        fuelLog.pricePerLitre = this.calculatePricePerLitre(this.form.controls.priceType.value, this.form.controls.price.value, this.form.controls.addToLeftTank.value, this.form.controls.addToRightTank.value)
        fuelLog.airport = this.form.controls.airport.value!
        fuelLog.fbo = this.form.controls.fbo.value!
        fuelLog.comment = this.form.controls.comment.value!
        return fuelLog
    }
    onChangeTopUp(event: CheckboxChangeEvent) {
        console.log('onChangeTopUp(), event', event)
        if (event.checked) {
            const addToLeftTank = this.acParameters.eachTankCapacity - this.fuelLog.left
            this.form.controls.addToLeftTank.setValue(this.round(addToLeftTank, 1))
            const addToRightTank = this.acParameters.eachTankCapacity - this.fuelLog.right
            this.form.controls.addToRightTank.setValue(this.round(addToRightTank, 1))
        } else {
            this.form.controls.addToLeftTank.reset()
            this.form.controls.addToRightTank.reset()
        }
    }
    onInputAddToLeftTank(inputNumberInputEvent: InputNumberInputEvent) {
        // turn off Top up checkbox
        this.form.controls.topUp.setValue(false)
        const addToLeftTank = Number(inputNumberInputEvent.value)
        console.log('addToLeftTank', addToLeftTank)
        const calculatedTankCapacity = this.round(this.fuelLog.left + addToLeftTank, 1)
        if (calculatedTankCapacity > this.acParameters.eachTankCapacity) {
            this.form.controls.addToLeftTank.setErrors({ invalid: true })
        }
    }
    onInputAddToRightTank(inputNumberInputEvent: InputNumberInputEvent) {
        // turn off Top up checkbox
        this.form.controls.topUp.setValue(false)
        const addToRightTank = Number(inputNumberInputEvent.value)
        console.log('addToLeftTank', addToRightTank)
        const calculatedTankCapacity = this.round(this.fuelLog.right + addToRightTank, 1)
        if (calculatedTankCapacity > this.acParameters.eachTankCapacity) {
            this.form.controls.addToRightTank.setErrors({ invalid: true })
        }
    }


    onSubmit() {
        if (this.form.valid) {
            this.formSubmitted.emit(this.fillFuelLogWithValue());
        } else {
            console.log('Form is invalid');
        }
    }

    onCancel() {

    }

    toUpperCase() {
        const airportControl = this.form.controls.airport
        airportControl.setValue((airportControl.value ?? '').toUpperCase(), { emitEvent: false });
    }

    private calculatePricePerLitre(priceType: PriceTypeOptionEnum, price: number | null, addToLeftTank: number | null, addToRightTank: number | null): number {
        if (priceType == PriceTypeOptionEnum.PER_LITRE) {
            return price!
        } else {
            return this.round(price! / ((addToLeftTank! + addToRightTank!) * 3.78), 2)
        }
    }

    private round(value: number, precision: number): number {
        return Number(value.toFixed(1))
    }
}

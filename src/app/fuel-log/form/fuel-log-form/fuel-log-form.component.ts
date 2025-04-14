import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberInputEvent, InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter'
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { FuelLog, FuelTransactionTypeEnum } from '../../../domain/FuelLog';
import { AcParameters } from '../../../domain/AcParameters';
import { FuelPrice } from '../../../domain/FuelPrice';

export enum PriceTypeOptionEnum {
    PER_LITRE = 'Per litre', TOTAL = 'Total'
}
export enum TankSideEnum {
    LEFT, RIGHT
}

@Component({
    selector: 'app-fuel-log-form',
    imports: [CommonModule, ReactiveFormsModule, DatePickerModule, CheckboxModule, InputNumberModule, InputTextModule, KeyFilterModule, SelectModule, ButtonModule],
    templateUrl: './fuel-log-form.component.html',
    styleUrl: './fuel-log-form.component.css'
})
export class FuelLogFormComponent {

    fuelLog!: FuelLog
    @Input("fuelLog") set inputFuelLog(value: FuelLog) {
        console.log('@Input() set inputFuelLog(value: FuelLog) value: ', value)
        if (value === undefined) return
        // this.fuelLogSource.next(value)
        // this.fuelLogSource.subscribe(data => console.log('fuelLogSource data', data))
        this.fuelLog = value

        this.validateChangeToTank(this.form.controls.addToLeftTank, TankSideEnum.LEFT)
        this.validateChangeToTank(this.form.controls.addToRightTank, TankSideEnum.RIGHT)
        this.fillInFormWithValues()
        this.formReady = true
    }

    acParameters!: AcParameters
    @Input("acParameters") set inputAcParameters(value: AcParameters) {
        console.log('@Input() set inputAcParameters(value: AcParameters) value: ', value)
        if (value === undefined) return
        // this.acParametersSource.next(value)
        // this.acParametersSource.subscribe(data => console.log('acParametersSource data', data))
        this.acParameters = value
    }

    maintenanceMode: boolean = false // allows all fields to be editable and will not show top ip checkbox
    @Input("maintenanceMode") set inputMaintenanceMode(value: boolean) {
        console.log('@Input() set inputMaintenanceMode(value: boolean) value: ', value)
        if (value === undefined) return
        if (value) {
            this.form.controls.transactionType.enable();
        } else {
            this.form.controls.transactionType.disable();
        }
        this.maintenanceMode = value
    }

    displayOnly!: boolean // for delete operation
    @Input("displayOnly") set inputDisplayOnly(value: boolean) {
        console.log('@Input() set inputDisplayOnly(value: boolean) value: ', value)
        if (value === undefined) return
        // this.displayOnlySource.next(value)
        // this.displayOnlySource.subscribe(data => console.log('displayOnlySource data', data))
        if (value) {
            console.log('disable: true')
            this.form.disable()
            this.form.controls.deleteFuelPrice.enable()
        } else {
            console.log('disable: false')
            this.form.enable()
        }
        this.displayOnly = value
    }
    @Output() deleteFuelPrice = new EventEmitter<boolean>();
    @Output() formSubmitted = new EventEmitter<FuelLog>();
    @Output() formCancelled = new EventEmitter();

    priceTypeOptions: Array<PriceTypeOptionEnum> = [PriceTypeOptionEnum.PER_LITRE, PriceTypeOptionEnum.TOTAL]
    pricePerLitre!: number

    transactionTypeOptions: Array<{ label: string, value: FuelTransactionTypeEnum }> = [{ label: 'Flight', value: FuelTransactionTypeEnum.Flight }, { label: 'Refuel', value: FuelTransactionTypeEnum.Refuel }]

    fuelTransactionTypeEnum = FuelTransactionTypeEnum; // Expose the enum to the template

    formReady: boolean = false
    form = new FormGroup({
        date: new FormControl<Date>(new Date(), { nonNullable: true, validators: Validators.required }),
        transactionType: new FormControl<FuelTransactionTypeEnum>({ value: FuelTransactionTypeEnum.Refuel, disabled: true }, { nonNullable: true, validators: Validators.required }),
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
        deleteFuelPrice: new FormControl<boolean>(false)
    });

    constructor() {
    }

    private fillInFormWithValues() {
        console.log('this.fuelLog', this.fuelLog)
        this.form.reset()
        this.form.controls.date.setValue(this.fuelLog.date !== undefined ? new Date(this.fuelLog.date) : new Date())
        this.form.controls.transactionType.setValue(this.fuelLog.transactionType ? this.fuelLog.transactionType : FuelTransactionTypeEnum.Flight)
        this.form.controls.left.setValue(this.fuelLog.left)
        this.form.controls.right.setValue(this.fuelLog.right)
        this.form.controls.topUp.setValue(false)
        this.form.controls.addToLeftTank.setValue(this.fuelLog.changeInLeft)
        this.form.controls.addToRightTank.setValue(this.fuelLog.changeInRight)
        this.form.controls.priceType.setValue(PriceTypeOptionEnum.PER_LITRE)
        this.form.controls.price.setValue(this.fuelLog.fuelPrice?.pricePerLitre)
        this.form.controls.airport.setValue(this.fuelLog.fuelPrice?.airport)
        this.form.controls.fbo.setValue(this.fuelLog.fuelPrice?.fbo)
        this.form.controls.comment.setValue(this.fuelLog.fuelPrice?.comment)

        this.form.controls.deleteFuelPrice.setValue(false)
        this.deleteFuelPrice.emit(false)

        this.checkAndDisablePriceTypeAndPrice()

        console.log('this.form.value', this.form.value)
    }
    private fillFuelLogWithValues() {
        console.log('this.form.value', this.form.value)
        this.fuelLog.date = new Date(this.form.controls.date.value)
        // this.fuelLog.transactionType = getFuelTransactionTypeEnum(this.form.controls.transactionType.value)! as FuelTransactionTypeEnum
        this.fuelLog.transactionType = this.form.controls.transactionType.value
        this.fuelLog.left = this.form.controls.left.value!
        this.fuelLog.right = this.form.controls.right.value!
        this.fuelLog.changeInLeft = Number(this.form.controls.addToLeftTank.value!)
        this.fuelLog.changeInRight = Number(this.form.controls.addToRightTank.value!)
        // if (Number(this.form.controls.addToLeftTank.value!) >= 0 || Number(this.form.controls.addToRightTank.value!) >= 0) {
        this.fuelLog.fuelPrice = {} as FuelPrice
        if (this.form.controls.transactionType.value === FuelTransactionTypeEnum.Refuel) {
            if (! /* not */ this.pricePerLitre) {
                this.calculatePricePerLitre()
            }
            this.fuelLog.fuelPrice.pricePerLitre = this.pricePerLitre
            this.fuelLog.fuelPrice.airport = this.form.controls.airport.value!
            this.fuelLog.fuelPrice.fbo = this.form.controls.fbo.value!
            this.fuelLog.fuelPrice.comment = this.form.controls.comment.value!
        }

    }
    onChangeTransactionType(event: SelectChangeEvent) {
        console.log('event', event)
        console.log('event.value', event.value)
        // if (getFuelTransactionTypeEnum(event.value) === FuelTransactionTypeEnum.Flight) {
        if (event.value === FuelTransactionTypeEnum.Flight) {
            this.form.controls.priceType.disable()
            this.form.controls.price.disable()
            this.form.controls.airport.disable()
        } else {
            this.form.controls.priceType.enable()
            this.form.controls.price.enable()
            this.form.controls.airport.enable()
        }
    }
    onChangeTopUp(event: CheckboxChangeEvent) {
        console.log('onChangeTopUp(), event', event)
        if (event.checked) {
            const addToLeftTank = this.acParameters.eachTankCapacity - this.form.controls.left.value!
            this.form.controls.addToLeftTank.setValue(this.round(addToLeftTank, 1))
            const addToRightTank = this.acParameters.eachTankCapacity - this.form.controls.right.value!
            this.form.controls.addToRightTank.setValue(this.round(addToRightTank, 1))
            this.form.controls.addToLeftTank.disable()
            this.form.controls.addToRightTank.disable()
        } else {
            this.form.controls.addToLeftTank.reset()
            this.form.controls.addToRightTank.reset()
            this.form.controls.addToLeftTank.enable()
            this.form.controls.addToRightTank.enable()
        }
    }
    onInputLeft() {
        const calculatedTankCapacity = this.round(this.form.controls.left.value! + Number(this.form.controls.addToLeftTank.value!), 1)
        if (calculatedTankCapacity > this.acParameters.eachTankCapacity) {
            this.form.controls.left.setErrors({ invalid: true })
        } else {
            this.form.controls.left.setErrors(null)
        }
        this.form.controls.addToLeftTank.setErrors(null)

        this.calculatePricePerLitre()
    }
    onInputRight() {
        const calculatedTankCapacity = this.round(this.form.controls.right.value! + Number(this.form.controls.addToRightTank.value!), 1)
        if (calculatedTankCapacity > this.acParameters.eachTankCapacity) {
            this.form.controls.right.setErrors({ invalid: true })
        } else {
            this.form.controls.right.setErrors(null)
        }
        this.form.controls.addToRightTank.setErrors(null)

        this.calculatePricePerLitre()
    }
    onChangePriceType() {
        this.validatePrice()
    }
    onInputPrice() {
        this.validatePrice()
    }
    private validatePrice() {
        const priceControl = this.form.controls.price;
        console.log('priceControl.value', priceControl.value)
        console.log('this.form.controls.priceType.value', this.form.controls.priceType.value)
        if (this.form.controls.priceType.value === PriceTypeOptionEnum.PER_LITRE) {
            console.log('PER_LITRE')
            if (priceControl.value && Number(priceControl.value) > 99.99) {
                console.log('setErrors invalid')
                priceControl.setErrors({ invalid: true })
            }
        } else {
            console.log('TOTAL')
            if (priceControl.value && Number(priceControl.value) > 9999.99) {
                console.log('setErrors invalid')
                priceControl.setErrors({ invalid: true })
            }

        }
        this.calculatePricePerLitre()

    }
    onChangeDeleteFuelPrice(event: CheckboxChangeEvent) {
        console.log('event', event)
        this.deleteFuelPrice.emit(this.form.controls.deleteFuelPrice.value!)
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
        const priceType = this.form.controls.priceType.value
        const price = this.form.controls.price.value
        console.log('priceType', priceType, 'price', price)
        if (priceType == PriceTypeOptionEnum.PER_LITRE) {
            this.pricePerLitre = price!
        } else {
            const addToLeftTank = Number(this.form.controls.addToLeftTank.value)
            const addToRightTank = Number(this.form.controls.addToRightTank.value)
            this.pricePerLitre = this.round(price! / ((addToLeftTank! + addToRightTank!) * 3.78), 2)
        }
        console.log('this.pricePerLitre', this.pricePerLitre)
    }

    private round(value: number, precision: number): number {
        if (value.toLocaleString() == '-' || value.toLocaleString().endsWith('-')) {
            return 0
        } else {
            return Number(value.toFixed(precision))
        }
    }

    private checkAndDisablePriceTypeAndPrice() {
        console.log('checkAndDisablePriceTypeAndPrice()')
        // if addToLeftTanks & addToRightTank are negative then the priceType and price
        // controls wont appear and by disabling them the Required validtor wont be in effect
        // and allow the form to be valid
        if (Number(this.form.controls.addToLeftTank.value!) < 0 && Number(this.form.controls.addToRightTank.value!) < 0) {
            this.form.controls.priceType.disable()
            this.form.controls.price.disable()
            this.form.controls.price.clearValidators()
            this.form.controls.airport.clearValidators()
            return true
        } else {
            this.form.controls.priceType.enable()
            this.form.controls.price.enable()
            return false
        }
    }

    validateChangeToTank(control: FormControl, tankSideEnum: TankSideEnum) {

        const minValue: number = this.maintenanceMode ? -1 * this.acParameters.eachTankCapacity : 0
        const maxValue: number = 24
        const maxFractionDigits: number = 1

        control.valueChanges.subscribe(value => {
            const controlName = this.getControlName(this.form, control)
            console.log('Validating', controlName, ' value ', value);

            if (control.dirty) {
                // turn off Top up checkbox
                this.form.controls.topUp.setValue(false)
            }

            if (!value || (typeof value === 'string' && value.trim() === '')) {
                console.log('required')
                control.setErrors({ required: true });
                return
            }

            // change value type from string to number
            value = Number(value)
            if (value < minValue || value > maxValue) {
                console.log('minMaxError')
                control.setErrors({ minMaxError: true });
                return
            }

            const fractionPart = value.toString().split('.')[1];
            if (fractionPart && fractionPart.length > maxFractionDigits) {
                console.log('maxFractionDigitsError')
                control.setErrors({ maxFractionDigitsError: true });
                return
            }

            const inTank = (tankSideEnum === TankSideEnum.LEFT) ? this.form.controls.left.value : this.form.controls.right.value
            const calculatedTankCapacity = this.round(inTank! + value, 1)
            if (calculatedTankCapacity > this.acParameters.eachTankCapacity) {
                control.setErrors({ invalid: true })
                if (tankSideEnum === TankSideEnum.LEFT) {
                    this.form.controls.left.setErrors(null)
                } else {
                    this.form.controls.right.setErrors(null)
                }
                return
            }

            this.calculatePricePerLitre()

            control.setErrors(null);
        })
    }

    private getControlName(form: FormGroup, control: AbstractControl): string | null {
        return Object.keys(form.controls).find(name => form.controls[name] === control) || null;
    }

}

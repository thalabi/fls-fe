import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, NonNullableFormBuilder, FormBuilder } from '@angular/forms';
import { PriceTypeOptionEnum } from '../fuel-log-maintenance/fuel-log-maintenance.component';

@Component({
    selector: 'app-test',
    imports: [],
    templateUrl: './test.component.html',
    styleUrl: './test.component.css'
})
export class TestComponent {

    form2 = new FormGroup({
        date: new FormControl<Date>(new Date(), { nonNullable: true, validators: [Validators.required] }),
        topUp: new FormControl<boolean>(false, { nonNullable: true, validators: [Validators.required] }),
        addToLeftTank: new FormControl<number | null>(null),
        addToRightTank: new FormControl<number | null>(null),
        priceType: new FormControl<PriceTypeOptionEnum>(PriceTypeOptionEnum.PER_LITRE, { nonNullable: true }),
        price: new FormControl<number | null>(null),
        airport: new FormControl<string>('', { nonNullable: true }),
        fbo: new FormControl<string>('', { nonNullable: true }),
        comment: new FormControl<string>('', { nonNullable: true }),
    });

    form!: FormGroup<{
        date: FormControl<Date>;
        topUp: FormControl<boolean>;
        addToLeftTank: FormControl<number | null>;
        addToRightTank: FormControl<number | null>;
        priceType: FormControl<PriceTypeOptionEnum>;
        price: FormControl<number | null>;
        airport: FormControl<string>;
        fbo: FormControl<string>;
        comment: FormControl<string>;
    }>;

    form3!: FormGroup

    ngOnInit() {
        const now = new Date()
        this.form = new FormGroup({
            date: new FormControl<Date>(now, { nonNullable: true, validators: [Validators.required] }),
            topUp: new FormControl<boolean>(false, { nonNullable: true, validators: [Validators.required] }),
            addToLeftTank: new FormControl<number | null>(null),
            addToRightTank: new FormControl<number | null>(null),
            priceType: new FormControl<PriceTypeOptionEnum>(PriceTypeOptionEnum.PER_LITRE, { nonNullable: true }),
            price: new FormControl<number | null>(null),
            airport: new FormControl<string>('', { nonNullable: true }),
            fbo: new FormControl<string>('', { nonNullable: true }),
            comment: new FormControl<string>('', { nonNullable: true }),
        });

        const airport = this.form.controls.airport.value

        const comment = this.form2.controls.comment

        this.form3 = new FormGroup({
            date: new FormControl<Date>(new Date(), { nonNullable: true, validators: [Validators.required] }),
            topUp: new FormControl<boolean>(false, { nonNullable: true, validators: [Validators.required] }),
            addToLeftTank: new FormControl<number | null>(null),
            addToRightTank: new FormControl<number | null>(null),
            priceType: new FormControl<PriceTypeOptionEnum>(PriceTypeOptionEnum.PER_LITRE, { nonNullable: true }),
            price: new FormControl<number | null>(null),
            airport: new FormControl<string>('', { nonNullable: true }),
            fbo: new FormControl<string>('', { nonNullable: true }),
            comment: new FormControl<string>('', { nonNullable: true }),
        });

        const fbo = this.form3.controls['fbxxxo'].value;
    }
}

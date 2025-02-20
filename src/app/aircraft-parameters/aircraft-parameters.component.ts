import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    selector: 'app-aircraft-parameters',
    imports: [CommonModule, ReactiveFormsModule, InputNumberModule, ButtonModule],
    templateUrl: './aircraft-parameters.component.html',
    styleUrl: './aircraft-parameters.component.css'
})
export class AircraftParametersComponent implements OnInit {

    form!: FormGroup

    initialTsn!: number // from service
    initialTsmoh!: number // from service
    eachTankCapacity!: number // from service
    fuelBurnPerHour!: number // from service

    constructor(/*private productService: ProductService*/) { }

    ngOnInit(): void {
        this.form = new FormGroup({
            initialTsn: new FormControl<number | null>(null, Validators.required),
            initialTsmoh: new FormControl<number | null>(null, Validators.required),
            eachTankCapacity: new FormControl<number | null>(null, Validators.required),
            fuelBurnPerHour: new FormControl<number | null>(null, Validators.required),
        });
    }

    onSubmit() {

    }
    onCancel() {

    }
}

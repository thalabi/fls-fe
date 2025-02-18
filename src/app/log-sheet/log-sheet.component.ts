import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
@Component({
    selector: 'app-log-sheet',
    imports: [FluidModule, ReactiveFormsModule, DatePickerModule],
    templateUrl: './log-sheet.component.html',
    styleUrl: './log-sheet.component.css'
})
export class LogSheetComponent implements OnInit {

    formGroup!: FormGroup;

    constructor(/*private productService: ProductService*/) { }

    ngOnInit() {
        this.formGroup = new FormGroup({
            flightDate: new FormControl<Date | null>(null),
            startupTime: new FormControl<Date | null>(null),
        });
    }

}

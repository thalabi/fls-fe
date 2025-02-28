import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-refuel',
    imports: [],
    templateUrl: './refuel.component.html',
    styleUrl: './refuel.component.css'
})
export class RefuelComponent implements OnInit {

    constructor(private messageService: MessageService) { }

    ngOnInit(): void {
        this.messageService.clear()
    }

}

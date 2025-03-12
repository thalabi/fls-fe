import { Component, OnInit } from '@angular/core';
import { SessionService } from '../service/session.service';
import { PopoverModule } from 'primeng/popover';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-backend-stacktrace-display',
    imports: [CommonModule, ButtonModule, PopoverModule, TextareaModule],
    templateUrl: './backend-stacktrace-display.component.html',
    styleUrls: ['./backend-stacktrace-display.component.css']
})
export class BackendStacktraceDisplayComponent implements OnInit {

    stackTrace?: string

    constructor(private sessionService: SessionService) { }

    ngOnInit() {
        this.sessionService.backendExceptionstackTrace$.subscribe({
            next: backendExceptionstack => {
                this.stackTrace = backendExceptionstack
            }
        })
    }

    clearStackTrace() {
        this.sessionService.clearBackendStackTrace()
    }
}

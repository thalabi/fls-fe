import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { ValidateAirportIdentifierResponse } from '../response/ValidateAirportIdentifierResponse';

@Injectable({
    providedIn: 'root'
})
export class AirportService {

    constructor(
        private restService: RestService,
        private messageService: MessageService
    ) { }

    validateAirportIdentifier(identifier: string, control: FormControl) {
        if (!identifier || identifier.length < 3) {
            control.setErrors({ invalid: true })
            return
        }
        console.log('control', control, 'value', identifier)
        this.restService.validateAirportIdentifier(identifier).subscribe(
            {
                next: (validateAirportIdentifierResponse: ValidateAirportIdentifierResponse) => {
                    console.log('validateAirportIdentifierResponse.valid', validateAirportIdentifierResponse.valid);
                    if (!validateAirportIdentifierResponse.valid) {
                        control.setErrors({ invalid: true })
                    } else if (validateAirportIdentifierResponse.valid) {
                        control.setErrors(null)
                    } else {
                        console.log('this.restService.validateAirportIdentifier returned', validateAirportIdentifierResponse.valid)
                    }
                },
                complete: () => {
                    console.log('this.restService.validateAirportIdentifier completed')
                }
                ,
                error: (httpErrorResponse: HttpErrorResponse): void => {
                    console.log('httpErrorResponse', httpErrorResponse)
                    if ((httpErrorResponse.error.stackTrace as string).includes('LoadingFromExternalApiException')) {
                        this.messageService.add({ severity: 'warn', summary: 'Unable to validate airport identifiers' });
                    }
                }
            });

    }

}

import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { MessageService } from "primeng/api";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { SessionService } from "./service/session.service";

export function httpErrorInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

    const messageService = inject(MessageService)
    const sessionService = inject(SessionService)

    console.log('HttpErrorInterceptor');
    console.log('request: %o', request);
    return next(request).pipe(
        map((httpEvent: HttpEvent<any>) => {
            if (httpEvent instanceof HttpResponse) {
                console.log('response: %o', httpEvent);
            }
            // return the http response
            return httpEvent;
        }),
        catchError((httpErrorResponse: HttpErrorResponse) => {
            console.error('httpErrorResponse: [%o]', httpErrorResponse);
            let errorMessage: string;
            if (httpErrorResponse.error instanceof ErrorEvent) {
                // client-side error
                errorMessage = httpErrorResponse.error.message;
                console.error('Client error: [%s]', errorMessage);
            } else {
                // server-side error
                errorMessage = httpErrorResponse.message;
                console.error('Server error: [%s]', errorMessage);
                console.error('httpErrorResponse.status: [%s]', httpErrorResponse.status)
            }
            messageService.add({ severity: 'error', summary: getStatusText(httpErrorResponse.status), detail: errorMessage });
            sessionService.setBackendExceptionstackTrace(httpErrorResponse.error.stackTrace)
            throw httpErrorResponse;
        })
    );
}

export function getStatusText(statusCode: number) {
    return {
        0: "Connection Failure", // this is not valid HTTP code but added here for coding simplicity
        100: "Continue",
        101: "Switching Protocols",
        102: "Processing",
        200: "OK",
        201: "Created",
        202: "Accepted",
        203: "Non-authoritative Information",
        204: "No Content",
        205: "Reset Content",
        206: "Partial Content",
        207: "Multi-Status",
        208: "Already Reported",
        226: "IM Used",
        300: "Multiple Choices",
        301: "Moved Permanently",
        302: "Found",
        303: "See Other",
        304: "Not Modified",
        305: "Use Proxy",
        307: "Temporary Redirect",
        308: "Permanent Redirect",
        400: "Bad Request",
        401: "Unauthorized",
        402: "Payment Required",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        406: "Not Acceptable",
        407: "Proxy Authentication Required",
        408: "Request Timeout",
        409: "Conflict",
        410: "Gone",
        411: "Length Required",
        412: "Precondition Failed",
        413: "Payload Too Large",
        414: "Request-URI Too Long",
        415: "Unsupported Media Type",
        416: "Requested Range Not Satisfiable",
        417: "Expectation Failed",
        418: "I'm a teapot",
        421: "Misdirected Request",
        422: "Unprocessable Entity",
        423: "Locked",
        424: "Failed Dependency",
        426: "Upgrade Required",
        428: "Precondition Required",
        429: "Too Many Requests",
        431: "Request Header Fields Too Large",
        444: "Connection Closed Without Response",
        451: "Unavailable For Legal Reasons",
        499: "Client Closed Request",
        500: "Internal Server Error",
        501: "Not Implemented",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout",
        505: "HTTP Version Not Supported",
        506: "Variant Also Negotiates",
        507: "Insufficient Storage",
        508: "Loop Detected",
        510: "Not Extended",
        511: "Network Authentication Required",
        599: "Network Connect Timeout Error"
    }[statusCode] || ''
}

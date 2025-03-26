import { LogSheet } from "../domain/LogSheet";
import { HalResponseLinks } from "./hal/hal-response-links";
import { HalResponsePage } from "./hal/hal-response-page";

export interface LogSheetResponse {
    _embedded:
    | { logSheets: Array<LogSheet>; simpleModels?: never } // produced by HATEOS
    | { simpleModels: Array<LogSheet>; logSheets?: never }; // produced by GenericEntityController

    _links: HalResponseLinks;
    page: HalResponsePage;
}
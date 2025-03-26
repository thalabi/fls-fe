import { JourneyLog } from "../domain/JourneyLog";
import { LogSheet } from "../domain/LogSheet";
import { HalResponseLinks } from "./hal/hal-response-links";
import { HalResponsePage } from "./hal/hal-response-page";

export interface JourneyLogResponse {
    _embedded:
    | { journeyLogs: Array<JourneyLog>; simpleModels?: never } // produced by HATEOS
    | { simpleModels: Array<JourneyLog>; journeyLogs?: never }; // produced by GenericEntityController

    _links: HalResponseLinks;
    page: HalResponsePage;
}
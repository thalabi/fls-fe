import { EngineLog } from "../domain/EngineLog";
import { JourneyLog } from "../domain/JourneyLog";
import { LogSheet } from "../domain/LogSheet";
import { HalResponseLinks } from "./hal/hal-response-links";
import { HalResponsePage } from "./hal/hal-response-page";

export interface EngineLogResponse {
    _embedded:
    | { engineLogs: Array<EngineLog>; simpleModels?: never } // produced by HATEOS
    | { simpleModels: Array<EngineLog>; engineLogs?: never }; // produced by GenericEntityController

    _links: HalResponseLinks;
    page: HalResponsePage;
}
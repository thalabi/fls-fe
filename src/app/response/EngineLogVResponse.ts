import { EngineLogV } from "../domain/EngineLogV";
import { HalResponseLinks } from "./hal/hal-response-links";
import { HalResponsePage } from "./hal/hal-response-page";

export interface EngineLogVResponse {
    _embedded:
    | { engineLogVs: Array<EngineLogV>; simpleModels?: never } // produced by HATEOS
    | { simpleModels: Array<EngineLogV>; engineLogVs?: never }; // produced by GenericEntityController

    _links: HalResponseLinks;
    page: HalResponsePage;
}
import { JourneyLogV } from "../domain/JourneyLogV";
import { HalResponseLinks } from "./hal/hal-response-links";
import { HalResponsePage } from "./hal/hal-response-page";

export interface JourneyLogVResponse {
    _embedded:
    | { journeyLogVs: Array<JourneyLogV>; simpleModels?: never } // produced by HATEOS
    | { simpleModels: Array<JourneyLogV>; journeyLogVs?: never }; // produced by GenericEntityController

    _links: HalResponseLinks;
    page: HalResponsePage;
}
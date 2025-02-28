import { AcParameters } from "../domain/AcParameters";
import { FuelLog } from "../domain/FuelLog";
import { HalResponseLinks } from "./hal/hal-response-links";
import { HalResponsePage } from "./hal/hal-response-page";

export interface AcParametersResponse {
    _embedded:
    | { acParameterses: Array<AcParameters>; simpleModels?: never } // produced by HATEOS
    | { simpleModels: Array<AcParameters>; acParameterses?: never }; // produced by GenericEntityController

    _links: HalResponseLinks;
    page: HalResponsePage;
}
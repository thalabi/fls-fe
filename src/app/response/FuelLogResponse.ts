import { FuelLog } from "../domain/FuelLog";
import { HalResponseLinks } from "../response/hal/hal-response-links";
import { HalResponsePage } from "../response/hal/hal-response-page";

export interface FuelLogResponse {
    _embedded:
    | { fuelLogs: Array<FuelLog>; fuelLogModels?: never } // produced by HATEOS
    | { fuelLogModels: Array<FuelLog>; fuelLogs?: never }; // produced by GenericEntityController

    _links: HalResponseLinks;
    page: HalResponsePage;
}
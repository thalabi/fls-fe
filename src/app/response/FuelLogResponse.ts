import { FuelLog } from "../fuel-log-maintenance/FuelLog";
import { HalResponseLinks } from "../hal/hal-response-links";
import { HalResponsePage } from "../hal/hal-response-page";

export interface FuelLogResponse {
    _embedded:
    | { fuelLogs: Array<FuelLog>; simpleModels?: never }
    | { simpleModels: Array<FuelLog>; fuelLogs?: never };

    _links: HalResponseLinks;
    page: HalResponsePage;
}
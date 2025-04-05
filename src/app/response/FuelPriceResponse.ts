
import { FuelPrice } from "../domain/FuelPrice";
import { HalResponseLinks } from "./hal/hal-response-links";
import { HalResponsePage } from "./hal/hal-response-page";

export interface FuelPriceResponse {
    _embedded:
    | { fuelPrices: Array<FuelPrice>; simpleModels?: never } // produced by HATEOS
    | { simpleModels: Array<FuelPrice>; fuelPrices?: never }; // produced by GenericEntityController

    _links: HalResponseLinks;
    page: HalResponsePage;
}
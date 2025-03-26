import { TsnV } from "../domain/TsnV";
import { HalResponseLinks } from "./hal/hal-response-links";
import { HalResponsePage } from "./hal/hal-response-page";

export interface TsnVResponse {
    _embedded:
    | { tsnVs: Array<TsnV>; simpleModels?: never } // produced by HATEOS
    | { simpleModels: Array<TsnV>; tsnVs?: never }; // produced by GenericEntityController

    _links: HalResponseLinks;
    page: HalResponsePage;
}
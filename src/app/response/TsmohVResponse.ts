import { TsmohV } from "../domain/TsmohV";
import { TsnV } from "../domain/TsnV";
import { HalResponseLinks } from "./hal/hal-response-links";
import { HalResponsePage } from "./hal/hal-response-page";

export interface TsmohVResponse {
    _embedded:
    | { tsmohVs: Array<TsmohV>; simpleModels?: never } // produced by HATEOS
    | { simpleModels: Array<TsmohV>; tsmohVs?: never }; // produced by GenericEntityController

    _links: HalResponseLinks;
    page: HalResponsePage;
}
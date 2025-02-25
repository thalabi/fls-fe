import { HalResponseLinks } from "../hal/hal-response-links";
import { HalResponsePage } from "../hal/hal-response-page";

export interface IGenericEntityResponse {
    // _embedded: {[rows: string]: Array<IGenericEntity>}
    [colums: string]: any;

    // created: Date;
    // modified: Date;

    _links: HalResponseLinks;
    page: HalResponsePage;
}

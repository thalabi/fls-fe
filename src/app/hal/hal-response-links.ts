import { HalHref } from "./hal-href";

export interface HalResponseLinks {
    first: HalHref;
    prev: HalHref;
    self: HalHref;
    next: HalHref;
    last: HalHref;
    profile: HalHref;
    search: HalHref;
}

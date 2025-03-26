export interface TsmohV {
    id: number;
    registration: string;
    tsmoh: number;
    _links: {
        self: {
            href: URL
        },
        tsmohV: {
            href: URL
        }
    };
}
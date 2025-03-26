export interface TsnV {
    id: number;
    registration: string;
    tsn: number;
    _links: {
        self: {
            href: URL
        },
        tsnV: {
            href: URL
        }
    };
}
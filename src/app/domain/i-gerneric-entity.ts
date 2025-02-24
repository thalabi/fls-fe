export interface IGenericEntity {
    id: number;

    [colums: string]: any;

    //created: Date;
    //modified: Date;

    //version: number; is set as ETag

    _links: { self: { href: string } };
}
export declare class Fetcher {
    url: string;
    pageSize: number;
    query: string;
    constructor(url: string, pageSize: number, query: string);
    fetch(offset: number): Promise<import("rdf-js").Quad[]>;
}

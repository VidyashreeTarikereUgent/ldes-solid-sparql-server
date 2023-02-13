export declare class Fetcher {
    url: string;
    pageSize: number;
    constructor(url: string, pageSize: number);
    fetch(offset: number): Promise<import("rdf-js").Quad[]>;
}

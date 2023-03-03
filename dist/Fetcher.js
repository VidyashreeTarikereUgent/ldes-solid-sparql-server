"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fetcher = void 0;
const query_sparql_1 = require("@comunica/query-sparql");
const myEngine = new query_sparql_1.QueryEngine();
// function getQuery(offset: number, pageSize: number) {
//     return `
// PREFIX prov: <http://www.w3.org/ns/prov#>
// PREFIX foaf: <http://xmlns.com/foaf/0.1/>
// PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
// PREFIX brt: <http://brt.basisregistraties.overheid.nl/def/top10nl#>
// PREFIX bag: <http://bag.basisregistraties.overheid.nl/def/bag#>
// PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
// PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
// PREFIX ex: <http://example.org/ns#>
// PREFIX dcterms: <http://purl.org/dc/terms/>
// }
class Fetcher {
    constructor(url, pageSize, query) {
        this.url = url;
        this.pageSize = pageSize;
        this.query = query;
    }
    async fetch(offset) {
        const query = this.query.replace("${offset}", offset + "").replace("${pageSize}", this.pageSize + "");
        const response = await myEngine.queryQuads(query, { sources: [this.url] });
        const quads = await response.toArray();
        console.log(quads);
        return quads;
    }
}
exports.Fetcher = Fetcher;
//# sourceMappingURL=Fetcher.js.map
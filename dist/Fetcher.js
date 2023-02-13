"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fetcher = void 0;
const query_sparql_1 = require("@comunica/query-sparql");
const myEngine = new query_sparql_1.QueryEngine();
function getQuery(offset, pageSize) {
    return `
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX brt: <http://brt.basisregistraties.overheid.nl/def/top10nl#>
PREFIX bag: <http://bag.basisregistraties.overheid.nl/def/bag#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ex: <http://example.org/>
PREFIX dcterms: <http://purl.org/dc/terms/>

CONSTRUCT {
 ?version a ex:RoadName ;
     rdfs:label ?label ;
    dcterms:isVersionOf ?s ;
    prov:generatedAtTime ?genAtTime ;
    <https://data.kkg.kadaster.nl/nen3610/model/def/beginGeldigheid> ?validStarting
} WHERE {
  # ?s is a thing in the public domain
  ?s a <https://data.kkg.kadaster.nl/sor/model/def/OpenbareRuimte> ;
     # Registered using this version (~ dcterms:hasVersion)
     <https://data.kkg.kadaster.nl/sor/model/def/geregistreerdMet> ?version ;
     #?s has a type “road”
     <https://data.kkg.kadaster.nl/sor/model/def/type> <https://data.kkg.kadaster.nl/nen3610/model/def/Weg> ;
     skos:prefLabel ?label .
  
  ?version 
     # Registered at this timestamp
     <https://data.kkg.kadaster.nl/nen3610/model/def/tijdstipRegistratie> ?genAtTime ;
     # But it only starts being the actual state of the streetnames at
     <https://data.kkg.kadaster.nl/nen3610/model/def/beginGeldigheid> ?validStarting ;
} ORDER BY ASC(?genAtTime)
  OFFSET ${offset}
  LIMIT ${pageSize}
`;
}
class Fetcher {
    constructor(url, pageSize) {
        this.url = url;
        this.pageSize = pageSize;
    }
    async fetch(offset) {
        const response = await myEngine.queryQuads(getQuery(offset, this.pageSize), { sources: [this.url] });
        const quads = await response.toArray();
        console.log(quads);
        return quads;
    }
}
exports.Fetcher = Fetcher;
//# sourceMappingURL=Fetcher.js.map
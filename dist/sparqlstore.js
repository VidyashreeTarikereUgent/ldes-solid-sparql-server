"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparqlStore = void 0;
const community_server_1 = require("@solid/community-server");
const types_1 = require("@treecg/types");
const fs_1 = require("fs");
const n3_1 = require("n3");
const rdf_data_factory_1 = require("rdf-data-factory");
const Fetcher_1 = require("./Fetcher");
const datafactory = new rdf_data_factory_1.DataFactory();
function ldesRelation(offset, generatedAtTime, base, relationType, treePath) {
    const quads = `
    @prefix tree: <https://w3id.org/tree#>.
    @prefix prov:  <http://www.w3.org/ns/prov#generatedAtTime>.
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

    <> a tree:Node ;
    tree:relation[
        a <${relationType}> ;
        tree:path <${treePath}> ;
        tree:node <./?page=${offset + 1}> ;
        tree:value "${generatedAtTime}"^^xsd:dateTime ;
    ].
    `;
    const parser = new n3_1.Parser({ baseIRI: base });
    return parser.parse(quads);
}
function compareGeneratedAtTime(x, y) {
    const date1 = new Date(x.value);
    const date2 = new Date(y.value);
    if (date1 > date2) {
        return x;
    }
    else {
        return y;
    }
}
class SparqlStore {
    constructor(pageSize, url, queryFileLocation, metadataLocation, relationType, host, path) {
        this.getRepresentation = async (identifier, preferences, conditions) => {
            console.log("Getting representation for " + identifier.path);
            const url = new URL(identifier.path);
            const page = url.searchParams.get("page");
            let quads;
            if (page) {
                quads = await this.fetcher.fetch(parseInt(page) * this.pageSize);
                const maxTimeObject = quads.filter(q => q.predicate.value === this.timetampPath).map(x => x.object).reduce(compareGeneratedAtTime);
                const relationQuads = ldesRelation(parseInt(page), maxTimeObject.value, identifier.path, this.relationType, this.timetampPath);
                const memberquads = [];
                const doneMember = new Set();
                for (let member of quads) {
                    if (!doneMember.has(member.subject.value)) {
                        doneMember.add(member.subject.value);
                        memberquads.push(datafactory.quad(datafactory.namedNode(this.host), datafactory.namedNode("https://w3id.org/tree#member"), member.subject));
                    }
                }
                quads.push(...relationQuads);
                quads.push(...memberquads);
            }
            else {
                quads = this.metadata;
            }
            return new community_server_1.BasicRepresentation((0, community_server_1.guardedStreamFrom)(quads), new community_server_1.RepresentationMetadata({ [community_server_1.CONTENT_TYPE]: community_server_1.INTERNAL_QUADS }));
        };
        this.setRepresentation = async (identifier, representation, conditions) => {
            console.log("Set representation", identifier, representation, conditions);
            throw "Not implemented set";
        };
        this.addResource = async (container, representation, conditions) => {
            console.log("Add representation", container, representation, conditions);
            throw "Not implemented add";
        };
        this.deleteResource = async (identifier, conditions) => {
            console.log("Delete representation", identifier, conditions);
            throw "Not implemented delete";
        };
        this.modifyResource = async (identifier, patch, conditions) => {
            console.log("Modify representation", identifier, patch, conditions);
            throw "Not implemented modify";
        };
        this.hasResource = async (identifier) => {
            return true;
        };
        this.pageSize = pageSize;
        this.host = host + path;
        const queryString = (0, fs_1.readFileSync)(queryFileLocation).toString();
        const metadataString = (0, fs_1.readFileSync)(metadataLocation).toString();
        const metadataQuads = new n3_1.Parser().parse(metadataString);
        const eventStreamSubject = metadataQuads.find(q => q.predicate.equals(types_1.RDF.terms.type) && q.object.equals(types_1.LDES.terms.EventStream)).subject;
        this.timetampPath = metadataQuads.find(q => q.subject.equals(eventStreamSubject) && q.predicate.equals(types_1.LDES.terms.timestampPath)).object.value;
        this.metadata = metadataQuads.map(q => {
            if (q.subject.equals(eventStreamSubject)) {
                return datafactory.quad(datafactory.namedNode(host + path), q.predicate, q.object, q.graph);
            }
            else {
                return q;
            }
        });
        this.relationType = relationType;
        this.fetcher = new Fetcher_1.Fetcher(url, this.pageSize, queryString);
    }
}
exports.SparqlStore = SparqlStore;
//# sourceMappingURL=sparqlstore.js.map
import { Quad, Quad_Object } from "@rdfjs/types";
import { BasicRepresentation, ChangeMap, Conditions, CONTENT_TYPE, guardedStreamFrom, INTERNAL_QUADS, Patch, Representation, RepresentationMetadata, RepresentationPreferences, ResourceIdentifier, ResourceStore } from "@solid/community-server";
import { Parser } from "n3";
import { DataFactory } from "rdf-data-factory";
import { Fetcher } from "./Fetcher";

export type SparqlFragment = {
    id: string,
    label: string,
    versionOf: string,
    timeGenerated: string,
    validFrom: Date
};

const datafactory = new DataFactory();

const ldesMetadata = `
    @prefix tree: <https://w3id.org/tree#>.
    @prefix ldes: <https://w3id.org/ldes#>.
    @prefix prov:  <http://www.w3.org/ns/prov#generatedAtTime>.
    @prefix ex: <http://www.example.com/ns#u>.

    ex:C1 a ldes:EventStream ;
        ldes:timestampPath prov:genAtTime ; 
        tree:view <?page=1> .
    `

function ldesRelation(offset: number, generatedAtTime: string, base: string) {
    const quads = `
    @prefix tree: <https://w3id.org/tree#>.
    @prefix prov:  <http://www.w3.org/ns/prov#generatedAtTime>.
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

    <> a tree:Node ;
    tree:relation[
        a tree:GreaterThanRelation ;
        tree:path prov:genAtTime ;
        tree:node <./?page=${offset + 1}> ;
        tree:value "${generatedAtTime}"^^xsd:dateTime ;
    ].
    `
    const parser = new Parser({ baseIRI: base })
    return parser.parse(quads)
}

function filterFunction(quad: Quad): boolean {
    const expectedPredicate = "http://www.w3.org/ns/prov#generatedAtTime"
    return quad.predicate.value === expectedPredicate
}

function compareGeneratedAtTime(x: Quad_Object, y: Quad_Object): Quad_Object {
    const date1 = new Date(x.value);
    const date2 = new Date(y.value);

    if (date1 > date2) {
        return x;
    } else { return y }
}

export class SparqlStore implements ResourceStore {

    fetcher: Fetcher;
    pageSize: number;

    constructor(pageSize: number, url: string) {
        this.pageSize = pageSize;
        this.fetcher = new Fetcher(url, this.pageSize)
    }

    getRepresentation = async (identifier: ResourceIdentifier, preferences: RepresentationPreferences, conditions?: Conditions): Promise<Representation> => {
        console.log("Getting representation for " + identifier.path);
        const url = new URL(identifier.path)
        const page = url.searchParams.get("page");
        let quads
        if (page) {
            quads = await this.fetcher.fetch(parseInt(page) * this.pageSize);
            const maxTimeObject = quads.filter(filterFunction).map(x => x.object).reduce(compareGeneratedAtTime);
            const relationQuads = ldesRelation(parseInt(page), maxTimeObject.value, identifier.path);

            const memberquads = [];
            const doneMember = new Set();
            for (let member of quads) {
                if (!doneMember.has(member.subject.value)) {
                    doneMember.add(member.subject.value);
                    memberquads.push(datafactory.quad(
                        datafactory.namedNode("http://www.example.com/ns#C1"),
                        datafactory.namedNode("https://w3id.org/tree#member"),
                        member.subject
                    ));
                }
            }

            quads.push(...relationQuads);
            quads.push(...memberquads);
        } else {
            const parser = new Parser()
            quads = parser.parse(ldesMetadata)
        }
        return new BasicRepresentation(
            guardedStreamFrom(quads),
            new RepresentationMetadata({ [CONTENT_TYPE]: INTERNAL_QUADS })
        );
    };

    setRepresentation = async (identifier: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ChangeMap> => {
        console.log("Set representation", identifier, representation, conditions)
        throw "Not implemented set"
    };
    addResource = async (container: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ChangeMap> => {
        console.log("Add representation", container, representation, conditions)
        throw "Not implemented add"
    };
    deleteResource = async (identifier: ResourceIdentifier, conditions?: Conditions): Promise<ChangeMap> => {
        console.log("Delete representation", identifier, conditions)
        throw "Not implemented delete"
    };
    modifyResource = async (identifier: ResourceIdentifier, patch: Patch, conditions?: Conditions): Promise<ChangeMap> => {
        console.log("Modify representation", identifier, patch, conditions)
        throw "Not implemented modify"
    };
    hasResource = async (identifier: ResourceIdentifier): Promise<boolean> => {
        return true;
    }

}


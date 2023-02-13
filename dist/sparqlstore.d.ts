import { ChangeMap, Conditions, Patch, Representation, RepresentationPreferences, ResourceIdentifier, ResourceStore } from "@solid/community-server";
import { Fetcher } from "./Fetcher";
export declare type SparqlFragment = {
    id: string;
    label: string;
    versionOf: string;
    timeGenerated: string;
    validFrom: Date;
};
export declare class SparqlStore implements ResourceStore {
    fetcher: Fetcher;
    pageSize: number;
    constructor(pageSize: number, url: string);
    getRepresentation: (identifier: ResourceIdentifier, preferences: RepresentationPreferences, conditions?: Conditions) => Promise<Representation>;
    setRepresentation: (identifier: ResourceIdentifier, representation: Representation, conditions?: Conditions) => Promise<ChangeMap>;
    addResource: (container: ResourceIdentifier, representation: Representation, conditions?: Conditions) => Promise<ChangeMap>;
    deleteResource: (identifier: ResourceIdentifier, conditions?: Conditions) => Promise<ChangeMap>;
    modifyResource: (identifier: ResourceIdentifier, patch: Patch, conditions?: Conditions) => Promise<ChangeMap>;
    hasResource: (identifier: ResourceIdentifier) => Promise<boolean>;
}

import { OpenApiClientGeneratorConfig } from './openapi-to-typescript-client';
import { OpenApiSchema } from '../schemas/common';
import { OpenApiDocument, OpenApiHttpMethod, OpenApiOperation, OpenApiPathItem, OpenApiPaths, OpenApiTag } from '../schemas/openapi';
export type CommonApiToTypescriptGeneratorSource = {
    type: 'file';
    path: string;
} | {
    type: 'url';
    url: string;
} | {
    type: 'object';
    object: unknown;
} | {
    type: 'string';
    data: string;
};
export interface ApiTypescriptGeneratorConfig {
    generates: (OpenApiClientGeneratorConfig & CommonOpenApiClientGeneratorConfig)[];
}
export type OpenApiDocumentPatchSchema = (schema: OpenApiSchema, schemaName: string) => OpenApiSchema | Promise<OpenApiSchema>;
export type OpenApiDocumentPatchAllSchemas = (schemas: {
    [schemaName: string]: OpenApiSchema;
}) => {
    [schemaName: string]: OpenApiSchema;
} | Promise<{
    [schemaName: string]: OpenApiSchema;
}>;
export type OpenApiDocumentPatchOperation = (operation: OpenApiOperation, path: string, httpMethod: OpenApiHttpMethod) => OpenApiOperation | Promise<OpenApiOperation>;
export type OpenApiDocumentPatchPathItem = (pathItem: OpenApiPathItem, path: string) => OpenApiPathItem | Promise<OpenApiPathItem>;
export type OpenApiDocumentPatchTags = (tags: OpenApiTag[]) => OpenApiTag[] | Promise<OpenApiTag[]>;
export type OpenApiDocumentPatchDocument = (document: OpenApiDocument) => OpenApiDocument | Promise<OpenApiDocument>;
export interface CommonOpenApiClientGeneratorConfigDocumentPatch {
    patchSchemas?: {
        [schemaName: string]: OpenApiDocumentPatchSchema;
    } | OpenApiDocumentPatchAllSchemas;
    patchPaths?: {
        [path: string]: {
            [method in OpenApiHttpMethod]?: OpenApiDocumentPatchOperation;
        } | OpenApiDocumentPatchPathItem;
    } | ((paths: OpenApiPaths) => OpenApiPaths);
    patchTags?: OpenApiDocumentPatchTags;
    patchDocument?: OpenApiDocumentPatchDocument;
}
export interface CommonOpenApiClientGeneratorConfigDocument {
    source: CommonApiToTypescriptGeneratorSource;
    patch?: CommonOpenApiClientGeneratorConfigDocumentPatch;
}
export interface CommonOpenApiClientGeneratorConfig {
    document: CommonOpenApiClientGeneratorConfigDocument;
    outputDirPath: string;
}
export interface ClientGenerationResult {
    files: ClientGenerationResultFile[];
}
export interface ClientGenerationResultFile {
    filename: string;
    data: string;
}

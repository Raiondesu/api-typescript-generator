import { OpenApiDocument } from './openapi';
import { CommonOpenApiClientGeneratorConfigDocumentPatch } from '../schema-to-typescript/config';
export declare function patchOpenApiDocument(document: OpenApiDocument, config: CommonOpenApiClientGeneratorConfigDocumentPatch): Promise<OpenApiDocument>;

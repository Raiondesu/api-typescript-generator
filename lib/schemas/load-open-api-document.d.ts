import { OpenApiDocument } from './openapi';
import { CommonOpenApiClientGeneratorConfigDocument } from '../schema-to-typescript/config';
export declare function loadOpenApiDocument(config: CommonOpenApiClientGeneratorConfigDocument): Promise<OpenApiDocument>;

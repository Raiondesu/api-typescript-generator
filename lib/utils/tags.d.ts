import { OpenApiDocument, OpenApiPaths, OpenApiTag } from '../schemas/openapi';
export interface ExtractedTags {
    taggedPaths: Record<string, OpenApiPaths>;
    rest: OpenApiPaths;
    tags: Record<string, OpenApiTag>;
}
export declare function extractTags(openApiDocument: OpenApiDocument): ExtractedTags;

import { OpenApiInfo, OpenApiExample, OpenApiExternalDocumentation, OpenApiParameter, OpenApiSchema, OpenApiServer } from './common';
export interface OpenApiComponents {
    schemas?: Record<string, OpenApiSchema>;
    responses?: Record<string, OpenApiResponse>;
    parameters?: Record<string, OpenApiParameter>;
    examples?: Record<string, OpenApiExample>;
    requestBodies?: Record<string, OpenApiRequestBody>;
    headers?: Record<string, OpenApiHeader>;
    securitySchemes?: Record<string, OpenApiSecurityScheme>;
    links?: Record<string, OpenApiLink>;
    callbacks?: Record<string, Record<string, OpenApiPathItem>>;
    pathItems?: Record<string, OpenApiPathItem>;
}
export interface OpenApiDocument {
    openapi: string;
    info: OpenApiInfo;
    jsonSchemaDialect?: string;
    servers?: OpenApiServer[];
    paths?: OpenApiPaths;
    webhooks?: Record<string, OpenApiPathItem>;
    components?: OpenApiComponents;
    security?: Record<string, string[]>;
    tags?: OpenApiTag[];
    externalDocs?: OpenApiExternalDocumentation;
}
export type OpenApiHeader = Omit<OpenApiParameter, 'name' | 'in'>;
export interface OpenApiLink {
    operationRef?: string;
    operationId?: string;
    parameters?: Record<string, unknown>;
    requestBody?: unknown;
    description?: string;
    server?: OpenApiServer;
}
export interface OpenApiSecurityScheme {
    type: 'apiKey' | 'http' | 'mutualTLS' | 'oauth2' | 'openIdConnect';
    description?: string;
    name?: string;
    in?: 'query' | 'header' | 'cookie';
    scheme?: string;
    bearerFormat?: string;
    flows?: OpenApiOAuthFlows;
    openIdConnectUrl?: string;
}
export interface OpenApiOAuthFlows {
    implicit?: OpenApiOAuthFlow;
    password?: OpenApiOAuthFlow;
    clientCredentials?: OpenApiOAuthFlow;
    authorizationCode?: OpenApiOAuthFlow;
}
export interface OpenApiOAuthFlow {
    authorizationUrl: string;
    tokenUrl: string;
    refreshUrl?: string;
    scopes: Record<string, string>;
}
export declare function isOpenApiDocument(document: unknown): document is OpenApiDocument;
export declare const openApiHttpMethods: readonly ["get", "put", "post", "delete", "options", "head", "patch", "trace"];
export type OpenApiHttpMethod = (typeof openApiHttpMethods)[number];
export type OpenApiPaths = Record<string, OpenApiPathItem>;
export type OpenApiPathItem = {
    summary?: string;
    description?: string;
    parameters?: OpenApiParameter[];
    servers?: OpenApiServer[];
} & {
    [K in OpenApiHttpMethod]?: OpenApiOperation;
};
export interface OpenApiMediaType {
    schema?: OpenApiSchema;
    example?: unknown;
    examples?: Record<string, OpenApiExample>;
    encoding?: Record<string, OpenApiEncoding>;
}
export interface OpenApiEncoding {
    contentType?: string;
    headers?: Record<string, OpenApiHeader>;
    style?: 'matrix' | 'label' | 'form' | 'simple' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';
    explode?: boolean;
    allowReserved?: boolean;
}
export interface OpenApiRequestBody {
    description?: string;
    content: Record<string, OpenApiMediaType>;
    required?: boolean;
}
export interface OpenApiResponse {
    description?: string;
    headers?: Record<string, OpenApiHeader>;
    content?: Record<string, OpenApiMediaType>;
    links?: Record<string, OpenApiLink>;
}
export interface OpenApiOperation {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: OpenApiExternalDocumentation;
    operationId?: string;
    parameters?: OpenApiParameter[];
    requestBody?: OpenApiRequestBody;
    responses?: Record<string, OpenApiResponse>;
    callbacks?: Record<string, OpenApiPathItem>;
    deprecated?: boolean;
    security?: Record<string, string[]>;
    servers?: OpenApiServer[];
}
export interface OpenApiTag {
    name: string;
    description?: string;
    externalDocs?: OpenApiExternalDocumentation;
}
export declare function processOpenApiDocument(document: unknown): OpenApiDocument;

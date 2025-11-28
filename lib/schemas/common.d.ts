export type OpenApiPrimitiveTypes = 'null' | 'number' | 'integer' | 'string' | 'boolean';
export type OpenApiFormats = 'int32' | 'int64' | 'float' | 'double' | 'byte' | 'binary' | 'date' | 'date-time' | 'password' | 'email';
export type OpenApiParameterStyle = 'matrix' | 'label' | 'form' | 'simple' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';
export type OpenApiParameterIn = 'query' | 'header' | 'path' | 'cookie';
export interface OpenApiParameter {
    name: string;
    in: OpenApiParameterIn;
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: OpenApiParameterStyle;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: OpenApiSchema;
    example?: unknown;
    examples?: Record<string, OpenApiExample>;
}
export interface OpenApiContact {
    name?: string;
    url?: string;
    email?: string;
}
export interface OpenApiLicense {
    name: string;
    identifier?: string;
    url?: string;
}
export interface OpenApiInfo {
    title: string;
    summary?: string;
    description?: string;
    termsOfService?: string;
    contact?: OpenApiContact;
    license?: OpenApiLicense;
    version: string;
}
export interface OpenApiServerVariable {
    enum?: string[];
    default: string;
    description?: string;
}
export interface OpenApiServer {
    url: string;
    description?: string;
    variables?: Record<string, OpenApiServerVariable>;
}
export interface OpenApiExternalDocumentation {
    description?: string;
    url: string;
}
export interface OpenApiExample {
    value: unknown;
    summary?: string;
    description?: string;
    externalValue?: string;
}
export type OpenApiSchemaPrimitiveValue = string | number | boolean | null;
export type OpenApiSchema = true | false | OpenApiExpandedSchema;
export interface OpenApiExpandedSchema {
    nullable?: boolean;
    type?: OpenApiPrimitiveTypes | OpenApiPrimitiveTypes[] | 'object' | 'array';
    format?: OpenApiFormats;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;
    properties?: Record<string, OpenApiSchema>;
    required?: string[];
    additionalProperties?: OpenApiSchema;
    patternProperties?: Record<string, OpenApiSchema>;
    minProperties?: number;
    maxProperties?: number;
    items?: OpenApiSchema;
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    contains?: OpenApiSchema;
    minContains?: number;
    maxContains?: number;
    prefixItems?: OpenApiSchema[];
    const?: OpenApiSchemaPrimitiveValue;
    enum?: OpenApiSchemaPrimitiveValue[];
    oneOf?: OpenApiSchema[];
    anyOf?: OpenApiSchema[];
    allOf?: OpenApiSchema[];
    not?: OpenApiSchema;
    discriminator?: {
        propertyName: string;
        mapping?: Record<string, string>;
    };
    $comment?: string;
    title?: string;
    description?: string;
    default?: unknown;
    example?: unknown;
    examples?: Record<string, OpenApiExample>;
    deprecated?: boolean;
    externalDocumentation?: OpenApiExternalDocumentation;
    name?: string;
}
export declare function extendSchema(base: OpenApiSchema, extension: OpenApiSchema): OpenApiSchema;
export declare function resolveDocumentReferences<T>(document: T): T;

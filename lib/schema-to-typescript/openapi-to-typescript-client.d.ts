import { OpenApiSchemaFieldPathItem } from './common';
import { ValidationProvider } from './common/validation-providers/validation-provider';
import { ClientGenerationResult, CommonOpenApiClientGeneratorConfig } from './config';
import { OpenApiInfo, OpenApiParameter, OpenApiSchema } from '../schemas/common';
import { OpenApiDocument, OpenApiMediaType, OpenApiOperation, OpenApiPathItem, OpenApiPaths, OpenApiRequestBody, OpenApiTag } from '../schemas/openapi';
import { JsDocBlock } from '../utils/jsdoc';
import { FilenameFormat } from '../utils/string-utils';
export type GenerateServiceJsDoc = (params: {
    suggestedJsDoc: JsDocBlock;
    tag: OpenApiTag;
    serviceName: string;
    paths: OpenApiPaths;
}) => JsDocBlock;
export type GenerateServiceName = (params: {
    suggestedName: string;
    tag: OpenApiTag;
    paths: OpenApiPaths;
}) => string;
export type GenerateOperationName = (params: {
    suggestedName: string;
    operation: OpenApiOperation;
    httpMethod: string;
    pathItem: OpenApiPathItem;
    path: string;
    serviceName?: string;
}) => string;
export type GenerateOperationJsDoc = (params: {
    suggestedJsDoc: JsDocBlock;
    operation: OpenApiOperation;
    httpMethod: string;
    pathItem: OpenApiPathItem;
    path: string;
    serviceName?: string;
}) => JsDocBlock;
export type GenerateOperationParameterArgumentName = (params: {
    suggestedName: string;
    parameter: OpenApiParameter;
    operation: OpenApiOperation;
    httpMethod: string;
    pathItem: OpenApiPathItem;
    path: string;
    operationName: string;
    serviceName?: string;
}) => string;
export type GenerateOperationParameterJsDoc = (params: {
    suggestedJsDoc: JsDocBlock;
    parameter: OpenApiParameter;
    operation: OpenApiOperation;
    httpMethod: string;
    pathItem: OpenApiPathItem;
    path: string;
    operationName: string;
    serviceName?: string;
}) => JsDocBlock;
export type GenerateOperationRequestBodyArgumentName = (params: {
    suggestedName: string;
    requestBody: OpenApiRequestBody;
    content: OpenApiMediaType;
    mediaType: string;
    operation: OpenApiOperation;
    httpMethod: string;
    pathItem: OpenApiPathItem;
    path: string;
    operationName: string;
    serviceName?: string;
}) => string;
export type GenerateOperationRequestBodyJsDoc = (params: {
    suggestedJsDoc: JsDocBlock;
    requestBody: OpenApiRequestBody;
    content: OpenApiMediaType;
    mediaType: string;
    operation: OpenApiOperation;
    httpMethod: string;
    pathItem: OpenApiPathItem;
    path: string;
    operationName: string;
    serviceName?: string;
}) => JsDocBlock;
export type GenerateOperationResultDescription = (params: {
    suggestedDescription: string;
    operation: OpenApiOperation;
    httpMethod: string;
    pathItem: OpenApiPathItem;
    path: string;
    serviceName?: string;
}) => string;
export type GenerateModelJsDoc = (params: {
    suggestedJsDoc: JsDocBlock;
    schema: OpenApiSchema;
    schemaName: string;
    fieldPath: OpenApiSchemaFieldPathItem[];
}) => JsDocBlock;
export type GenerateModelNameCallback = (context: {
    suggestedName: string;
    schemaName: string;
}) => string;
export type GenerateClientJsDoc = (params: {
    suggestedJsDoc: JsDocBlock;
    info: OpenApiInfo;
}) => JsDocBlock;
export type GenerateClientErrorJsDoc = (params: {
    suggestedJsDoc: JsDocBlock;
    info: OpenApiInfo;
}) => JsDocBlock;
export type GenerateCoreJsDoc = (params: {
    suggestedJsDoc: JsDocBlock;
    typeName: string;
    memberName?: string;
}) => JsDocBlock;
export type OpenApiClientExternalValueSourceImportEntity = {
    name: string;
} | 'default';
export interface OpenApiClientExternalValueSource {
    importPath: string;
    import: OpenApiClientExternalValueSourceImportEntity;
}
export interface OpenApiClientExternalValue {
    name: string | string[];
    source?: OpenApiClientExternalValueSource;
}
export interface OpenApiClientExternalType extends OpenApiClientExternalValue {
    typeParameters?: OpenApiClientExternalType[];
}
export type OpenApiClientBuiltinBinaryType = 'blob' | 'readableStream';
export type OpenApiClientCustomizableBinaryType = OpenApiClientBuiltinBinaryType | OpenApiClientExternalType;
export interface OpenApiClientGeneratorConfigOperations {
    generateOperationName?: GenerateOperationName;
    generateOperationJsDoc?: GenerateOperationJsDoc;
    generateOperationResultDescription?: GenerateOperationResultDescription;
    generateOperationParameterArgumentName?: GenerateOperationParameterArgumentName;
    generateOperationParameterJsDoc?: GenerateOperationParameterJsDoc;
    generateOperationRequestBodyArgumentName?: GenerateOperationRequestBodyArgumentName;
    generateOperationRequestBodyJsDoc?: GenerateOperationRequestBodyJsDoc;
    mediaTypeArgumentName?: string;
    validateResponse?: boolean;
    makeResponseValidationSchemasExtensible?: boolean;
    responseBinaryType?: OpenApiClientBuiltinBinaryType;
    showDeprecatedWarnings?: boolean;
}
export interface OpenApiClientGeneratorConfigClient {
    name: string;
    baseUrl?: string;
    errorClassName?: string;
    filename?: string;
    filenameFormat?: FilenameFormat;
    relativeDirPath?: string;
    includeServices?: 'all' | 'none' | {
        tags: string[];
    };
    exportServices?: 'all' | 'none' | {
        services: string[];
    };
    exportModels?: 'all' | 'none' | {
        models: string[];
    } | {
        schemas: string[];
    };
    exportErrorClass?: boolean;
    exportOptionsType?: boolean;
    generateJsDoc?: GenerateClientJsDoc;
    generateErrorJsDoc?: GenerateClientErrorJsDoc;
}
export interface OpenApiClientGeneratorConfigServices {
    filenameFormat?: FilenameFormat;
    relativeDirPath?: string;
    generateName?: GenerateServiceName;
    generateJsDoc?: GenerateServiceJsDoc;
    cleanupFiles?: boolean;
}
export interface OpenApiClientGeneratorConfigModels {
    filenameFormat?: FilenameFormat;
    relativeDirPath?: string;
    defaultScope?: string;
    generateJsDoc?: GenerateModelJsDoc;
    generateName?: GenerateModelNameCallback;
    cleanupFiles?: boolean;
}
export interface OpenApiClientGeneratorConfigCore {
    filenameFormat?: FilenameFormat;
    relativeDirPath?: string;
    cleanupFiles?: boolean;
    generateJsDoc?: GenerateCoreJsDoc;
}
export interface OpenApiClientGeneratorConfigValidationSchemaStorage {
    filenameFormat?: FilenameFormat;
    filename?: string;
    relativeDirPath?: string;
    exportName?: string;
}
export interface OpenApiClientGeneratorConfigValidation {
    library: 'zod';
    validationSchemaStorage?: OpenApiClientGeneratorConfigValidationSchemaStorage;
}
export interface OpenApiClientGeneratorConfigJsDocWordWrap {
    lineLength?: number;
}
export interface OpenApiClientGeneratorConfigJsDoc {
    wordWrap?: OpenApiClientGeneratorConfigJsDocWordWrap | false;
}
export interface OpenApiClientGeneratorConfigComments {
    leadingComment?: string;
    trailingComment?: string;
}
export interface OpenApiClientGeneratorConfig extends CommonOpenApiClientGeneratorConfig {
    type: 'openapiClient';
    operations?: OpenApiClientGeneratorConfigOperations;
    client: OpenApiClientGeneratorConfigClient | false;
    services?: OpenApiClientGeneratorConfigServices | false;
    models?: OpenApiClientGeneratorConfigModels;
    core?: OpenApiClientGeneratorConfigCore;
    validation?: OpenApiClientGeneratorConfigValidation;
    binaryTypes?: OpenApiClientCustomizableBinaryType[];
    jsDoc?: OpenApiClientGeneratorConfigJsDoc;
    comments?: OpenApiClientGeneratorConfigComments;
}
export interface OpenApiClientValidationContext {
    validationProvider: ValidationProvider;
    validationSchemaStorageImportPath: string;
    validationSchemaStorageImportName: string;
}
export declare function openapiToTypescriptClient({ document, generateConfig }: {
    document: OpenApiDocument;
    generateConfig: OpenApiClientGeneratorConfig;
}): Promise<ClientGenerationResult>;

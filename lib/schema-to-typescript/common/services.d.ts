import { GetModelData } from './models';
import { OpenApiPaths, OpenApiTag } from '../../schemas/openapi';
import { JsDocBlock, JsDocRenderConfig } from '../../utils/jsdoc';
import { CommentsRenderConfig } from '../common';
import { ClientGenerationResultFile } from '../config';
import { GenerateOperationName, OpenApiClientGeneratorConfig, OpenApiClientValidationContext, GenerateOperationJsDoc, OpenApiClientCustomizableBinaryType } from '../openapi-to-typescript-client';
export interface GeneratedServicesImportInfo {
    name: string;
    importPath: string;
    tag: string;
    jsdoc: JsDocBlock;
}
export interface GeneratedServices {
    files: ClientGenerationResultFile[];
    services: GeneratedServicesImportInfo[];
    deprecatedOperations: {
        [methodAndPath: string]: string;
    };
}
export declare const defaultServicesRelativeDirPath = "services";
export declare function generateServices({ taggedPaths, tags, commonHttpClientImportPath, commonHttpServiceImportPath, commonHttpServiceClassName, servicesConfig: { filenameFormat, relativeDirPath, generateName, generateJsDoc }, operationsConfig, getModelData, validationContext, binaryTypes, jsDocRenderConfig, commentsConfig }: {
    taggedPaths: Record<string, OpenApiPaths>;
    tags: Record<string, OpenApiTag>;
    servicesConfig: Exclude<OpenApiClientGeneratorConfig['services'], boolean>;
    commonHttpClientImportPath: string;
    commonHttpServiceClassName: string;
    commonHttpServiceImportPath: string;
    operationsConfig?: OpenApiClientGeneratorConfig['operations'];
    generateOperationName?: GenerateOperationName;
    generateOperationJsDoc?: GenerateOperationJsDoc;
    getModelData: GetModelData;
    validationContext?: OpenApiClientValidationContext;
    binaryTypes: OpenApiClientCustomizableBinaryType[];
    jsDocRenderConfig: JsDocRenderConfig;
    commentsConfig: CommentsRenderConfig;
}): GeneratedServices;

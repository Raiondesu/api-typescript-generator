import { JsDocRenderConfig } from '../../utils/jsdoc';
import { ExtractedTags } from '../../utils/tags';
import { CommentsRenderConfig } from '../common';
import { ClientGenerationResultFile } from '../config';
import { OpenApiClientCustomizableBinaryType, OpenApiClientGeneratorConfig, OpenApiClientValidationContext } from '../openapi-to-typescript-client';
export interface ModelImportInfo {
    modelName: string;
    schemaName: string;
    importPath: string;
    registerValidationSchemasImportName?: string;
}
export type ModelsIndex = Record<string, ModelImportInfo>;
export type GetModelData = (schemaName: string) => ModelImportInfo;
interface GeneratedModels {
    files: ClientGenerationResultFile[];
    modelsIndex: ModelsIndex;
}
export declare const defaultModelsRelativeDirPath = "models";
export declare function generateModels({ extractedTags, validationContext, modelsConfig: { filenameFormat, relativeDirPath, defaultScope, generateName, generateJsDoc }, commonValidationSchemaStorage, binaryTypes, jsDocRenderConfig, commentsConfig }: {
    extractedTags: ExtractedTags;
    validationContext?: OpenApiClientValidationContext;
    modelsConfig: OpenApiClientGeneratorConfig['models'];
    commonValidationSchemaStorage?: {
        importPath: string;
        className: string;
    };
    binaryTypes: OpenApiClientCustomizableBinaryType[];
    jsDocRenderConfig: JsDocRenderConfig;
    commentsConfig: CommentsRenderConfig;
}): GeneratedModels;
export {};

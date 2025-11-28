import { ClassProperty, Statement } from '@babel/types';
import { GetModelData } from './models';
import { OpenApiPaths } from '../../schemas/openapi';
import { DependencyImports } from '../../utils/dependencies';
import { JsDocRenderConfig } from '../../utils/jsdoc';
import { OpenApiClientCustomizableBinaryType, OpenApiClientGeneratorConfig, OpenApiClientValidationContext } from '../openapi-to-typescript-client';
export declare function generateOperationMethods({ paths, serviceName, getModelData, commonHttpClientImportName, validationContext, operationsConfig: { generateOperationName, generateOperationJsDoc, generateOperationResultDescription, generateOperationParameterArgumentName, generateOperationRequestBodyArgumentName, mediaTypeArgumentName, generateOperationParameterJsDoc, generateOperationRequestBodyJsDoc, validateResponse, makeResponseValidationSchemasExtensible, responseBinaryType }, operationImportPath, binaryTypes, jsDocRenderConfig }: {
    paths: OpenApiPaths;
    serviceName?: string;
    getModelData: GetModelData;
    commonHttpClientImportName: string;
    validationContext?: OpenApiClientValidationContext;
    operationsConfig?: OpenApiClientGeneratorConfig['operations'];
    operationImportPath: string;
    binaryTypes: OpenApiClientCustomizableBinaryType[];
    jsDocRenderConfig: JsDocRenderConfig;
}): {
    methods: ClassProperty[];
    dependencyImports: DependencyImports;
    validationStatements: Statement[];
    deprecatedOperations: {
        [methodAndPath: string]: string;
    };
};

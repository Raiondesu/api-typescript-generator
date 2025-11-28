import { Expression, Statement, TSType } from '@babel/types';
import { GetModelData } from './models';
import { OpenApiOperation } from '../../schemas/openapi';
import { DependencyImports } from '../../utils/dependencies';
import { OpenApiClientBuiltinBinaryType, OpenApiClientValidationContext } from '../openapi-to-typescript-client';
export type ResultWrapper = (expression: Expression) => Expression;
export interface OperationReturnType {
    type: TSType;
    dependencyImports: DependencyImports;
    suggestedDescription: string;
    wrapResultExpression: ResultWrapper;
    validationStatements: Statement[];
    modelRegisterValidationSchemaImports: Record<string, true>;
}
export declare function getOperationReturnType({ operation, getModelData, operationImportPath, commonHttpClientImportName, validationContext, serviceName, makeResponseValidationSchemasExtensible, binaryType }: {
    commonHttpClientImportName: string;
    operation: OpenApiOperation;
    getModelData: GetModelData;
    operationImportPath: string;
    validationContext?: OpenApiClientValidationContext;
    serviceName?: string;
    makeResponseValidationSchemasExtensible?: boolean;
    binaryType: OpenApiClientBuiltinBinaryType;
}): OperationReturnType;

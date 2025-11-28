import { ImportDeclaration } from '@babel/types';
import { GenerateSchemaTypeParams } from '../schema-to-typescript/common';
import { OpenApiClientExternalValueSourceImportEntity } from '../schema-to-typescript/openapi-to-typescript-client';
import { OpenApiSchema } from '../schemas/common';
interface DependencyImportsEntity {
    kind: 'value' | 'type';
    entity: OpenApiClientExternalValueSourceImportEntity;
}
export interface DependencyImports {
    [importPath: string]: {
        [aliasName: string]: DependencyImportsEntity;
    };
}
export declare function collectSchemaDependencies(schema: OpenApiSchema): Record<string, OpenApiSchema>;
export declare function generateSchemaTypeAndImports(params: Omit<GenerateSchemaTypeParams, 'getTypeName'> & {
    sourceImportPath: string;
    getModelData(schemaName: string): {
        modelName: string;
        importPath: string;
    };
}): {
    result: import("@babel/types").TSType;
    dependencyImports: DependencyImports;
};
export declare function extendDependenciesAndGetResult<T>(output: {
    result: T;
    dependencyImports: DependencyImports;
}, dependencyImports: DependencyImports): T;
export declare function generateTsImports(dependencyImports: DependencyImports): ImportDeclaration[];
export declare function addDependencyImport(dependencyImports: DependencyImports, importPath: string, aliasName: string, entity: DependencyImportsEntity): void;
export declare function extendDependencyImports(dependencyImports: DependencyImports, extension: DependencyImports): void;
export {};

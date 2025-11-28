import { identifier, importDeclaration, importDefaultSpecifier, importSpecifier, isImportSpecifier, stringLiteral, tsNullKeyword } from '@babel/types';
import R from 'ramda';
import { getRelativeImportPath } from './paths';
import { generateSchemaType, isNamedSchema } from '../schema-to-typescript/common';
export function collectSchemaDependencies(schema) {
    if (isNamedSchema(schema)) {
        return { [schema.name]: R.omit(['name'], schema) };
    }
    const result = {};
    generateSchemaType({
        schema,
        expand: true,
        getTypeName: (schemaName, subSchema) => {
            result[schemaName] = R.omit(['name'], subSchema);
            return schemaName;
        },
        getBinaryType: () => tsNullKeyword()
    });
    return result;
}
export function generateSchemaTypeAndImports(params) {
    const dependencyImports = {};
    const result = generateSchemaType({
        ...params,
        getTypeName: (schemaName) => {
            const { modelName, importPath } = params.getModelData(schemaName);
            addDependencyImport(dependencyImports, getRelativeImportPath(params.sourceImportPath, importPath), modelName, {
                kind: 'type',
                entity: { name: modelName }
            });
            return modelName;
        }
    });
    return { result, dependencyImports };
}
export function extendDependenciesAndGetResult(output, dependencyImports) {
    extendDependencyImports(dependencyImports, output.dependencyImports);
    return output.result;
}
export function generateTsImports(dependencyImports) {
    const entries = Object.entries(dependencyImports).sort(([a], [b]) => a.localeCompare(b));
    const result = [];
    for (const [path, imports] of entries) {
        const allTypes = Object.values(imports).every(({ kind }) => kind === 'type');
        const importSpecifiers = Object.entries(imports).map(([alias, { kind, entity }]) => {
            const specifier = entity === 'default'
                ? importDefaultSpecifier(identifier(alias))
                : importSpecifier(identifier(entity.name), identifier(entity.name));
            if (isImportSpecifier(specifier) && !allTypes && kind === 'type') {
                specifier.importKind = 'type';
            }
            return specifier;
        });
        const declaration = importDeclaration(importSpecifiers, stringLiteral(path));
        if (allTypes) {
            declaration.importKind = 'type';
        }
        result.push(declaration);
    }
    return result;
}
export function addDependencyImport(dependencyImports, importPath, aliasName, entity) {
    dependencyImports[importPath] || (dependencyImports[importPath] = {});
    dependencyImports[importPath][aliasName] = entity;
}
export function extendDependencyImports(dependencyImports, extension) {
    for (const [importPath, entities] of Object.entries(extension)) {
        dependencyImports[importPath] || (dependencyImports[importPath] = {});
        for (const [aliasName, entity] of Object.entries(entities)) {
            dependencyImports[importPath][aliasName] = entity;
        }
    }
}

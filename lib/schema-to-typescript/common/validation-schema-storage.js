import { arrowFunctionExpression, exportNamedDeclaration, identifier, newExpression, objectExpression, objectProperty, program, tsTypeParameterInstantiation, variableDeclaration, variableDeclarator } from '@babel/types';
import { addDependencyImport, extendDependenciesAndGetResult, generateTsImports } from '../../utils/dependencies';
import { getFilenameAndImportPath, getRelativeImportPath } from '../../utils/paths';
import { renderTypeScript } from '../common';
export async function generateValidationSchemaStorage({ commonValidationSchemaStorage, validationProvider, validationConfig: { validationSchemaStorage: { exportName = 'validationSchemaStorage', ...filenameFormatConfig } = {} }, commentsConfig }) {
    const dependencyImports = {};
    const { filename, importPath } = getFilenameAndImportPath('validation-schema-storage', filenameFormatConfig);
    addDependencyImport(dependencyImports, getRelativeImportPath(importPath, commonValidationSchemaStorage.importPath), commonValidationSchemaStorage.className, {
        kind: 'value',
        entity: { name: commonValidationSchemaStorage.className }
    });
    const generatedAssertCall = validationProvider.generateAssertCall(identifier('schema'), identifier('data'));
    const exportValidationSchemaStorage = exportNamedDeclaration(variableDeclaration('const', [
        variableDeclarator(identifier(exportName), Object.assign(newExpression(identifier(commonValidationSchemaStorage.className), [
            objectExpression([
                objectProperty(identifier('assertDataShape'), arrowFunctionExpression([identifier('schema'), identifier('data')], generatedAssertCall.result)),
                objectProperty(identifier('makeExtensible'), extendDependenciesAndGetResult(await validationProvider.generateMakeExtensibleCallback(), dependencyImports)),
                objectProperty(identifier('formatErrorMessage'), extendDependenciesAndGetResult(await validationProvider.generateFormatErrorMessageCallback(), dependencyImports)),
                objectProperty(identifier('lazyGetter'), arrowFunctionExpression([identifier('getSchema')], extendDependenciesAndGetResult(await validationProvider.generateLazyGetter(identifier('getSchema')), dependencyImports)))
            ])
        ]), {
            typeParameters: tsTypeParameterInstantiation([
                extendDependenciesAndGetResult(validationProvider.getSchemaType(), dependencyImports)
            ])
        }))
    ]));
    return {
        importName: exportName,
        importPath: importPath,
        file: {
            filename,
            data: renderTypeScript(program([...generateTsImports(dependencyImports), exportValidationSchemaStorage]), commentsConfig)
        }
    };
}

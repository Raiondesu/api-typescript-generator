import { identifier, tsQualifiedName, tsTypeParameterInstantiation, tsTypeReference, tsUnionType } from '@babel/types';
import { addDependencyImport, extendDependenciesAndGetResult } from '../../utils/dependencies';
import { getRelativeImportPath, isRelativeImportPath } from '../../utils/paths';
import { ucFirst } from '../../utils/string-utils';
import { simplifyUnionTypeIfPossible } from '../../utils/type-utils';
function qualifiedTypeName(name) {
    if (name.length === 0) {
        throw new Error('qualifiedTypeName: name is empty');
    }
    if (Array.isArray(name) && name.length > 1) {
        return tsQualifiedName(qualifiedTypeName(name.slice(0, -1)), identifier(name[name.length - 1]));
    }
    else {
        return identifier(Array.isArray(name) ? name[0] : name);
    }
}
export function generateBinaryType(config, basePath) {
    const dependencyImports = {};
    const result = tsUnionType([]);
    for (const binaryType of config) {
        if (typeof binaryType === 'string') {
            result.types.push(tsTypeReference(identifier(ucFirst(binaryType))));
        }
        else {
            const { name, source, typeParameters } = binaryType;
            let typeTemplateParameters;
            if (typeParameters) {
                typeTemplateParameters = tsTypeParameterInstantiation([]);
                for (const typeParameter of typeParameters) {
                    typeTemplateParameters.params.push(extendDependenciesAndGetResult(generateBinaryType([typeParameter], basePath), dependencyImports));
                }
            }
            if (source) {
                const importedEntityName = Array.isArray(name) ? name[0] : name;
                addDependencyImport(dependencyImports, isRelativeImportPath(source.importPath)
                    ? getRelativeImportPath(basePath, source.importPath)
                    : source.importPath, importedEntityName, {
                    kind: 'type',
                    entity: source.import
                });
            }
            result.types.push(tsTypeReference(qualifiedTypeName(name), typeTemplateParameters));
        }
    }
    return { result: simplifyUnionTypeIfPossible(result), dependencyImports };
}

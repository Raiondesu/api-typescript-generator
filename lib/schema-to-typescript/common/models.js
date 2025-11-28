import path from 'path';
import { arrayExpression, blockStatement, callExpression, exportNamedDeclaration, expressionStatement, functionDeclaration, identifier, isTSIndexSignature, isTSIntersectionType, isTSTypeLiteral, memberExpression, program, stringLiteral, tsExpressionWithTypeArguments, tsInterfaceBody, tsInterfaceDeclaration, tsTypeAliasDeclaration, tsTypeAnnotation, tsTypeParameterInstantiation, tsTypeReference } from '@babel/types';
import * as R from 'ramda';
import { generateBinaryType } from './binary';
import { openApiHttpMethods } from '../../schemas/openapi';
import { addDependencyImport, collectSchemaDependencies, extendDependenciesAndGetResult, generateTsImports } from '../../utils/dependencies';
import { attachJsDocComment, extractJsDoc, renderJsDoc } from '../../utils/jsdoc';
import { getRelativeImportPath } from '../../utils/paths';
import { applyEntityNameCase, formatFilename } from '../../utils/string-utils';
import { attachTypeAnnotation, generateSchemaType, renderTypeScript } from '../common';
function generateTypeExport({ modelName, schemaName, getModelName, schema, generateJsDoc, binaryTypes, importPath, jsDocRenderConfig }) {
    const dependencyImports = {};
    const schemaType = generateSchemaType({
        schema,
        getTypeName: getModelName,
        getBinaryType: () => extendDependenciesAndGetResult(generateBinaryType(binaryTypes, importPath), dependencyImports),
        processJsDoc: generateJsDoc &&
            ((jsdoc, schema, path) => generateJsDoc({
                suggestedJsDoc: jsdoc,
                schema,
                schemaName,
                fieldPath: path
            }))
    });
    let exportedType = isTSTypeLiteral(schemaType)
        ? tsInterfaceDeclaration(identifier(modelName), null, null, tsInterfaceBody(schemaType.members))
        : tsTypeAliasDeclaration(identifier(modelName), null, schemaType);
    if (!isTSTypeLiteral(schemaType)) {
        if (isTSIntersectionType(schemaType) && schemaType.types.length === 2) {
            const [interfaceBody, additionalProperties] = schemaType.types;
            if (isTSTypeLiteral(interfaceBody) &&
                isTSTypeLiteral(additionalProperties) &&
                additionalProperties.members.length === 1) {
                const additionalPropertiesMember = additionalProperties.members[0];
                if (isTSIndexSignature(additionalPropertiesMember)) {
                    exportedType = tsInterfaceDeclaration(identifier(modelName), null, [
                        tsExpressionWithTypeArguments(identifier('Record'), tsTypeParameterInstantiation([
                            additionalPropertiesMember.parameters[0].typeAnnotation
                                .typeAnnotation,
                            additionalPropertiesMember.typeAnnotation.typeAnnotation
                        ]))
                    ], tsInterfaceBody(interfaceBody.members));
                }
            }
        }
    }
    let jsdoc = extractJsDoc(schema);
    if (generateJsDoc) {
        jsdoc = generateJsDoc({
            suggestedJsDoc: jsdoc,
            schemaName,
            fieldPath: [],
            schema
        });
    }
    return {
        result: attachJsDocComment(exportNamedDeclaration(exportedType), renderJsDoc(jsdoc, jsDocRenderConfig)),
        dependencyImports
    };
}
export const defaultModelsRelativeDirPath = 'models';
function generateRegisterValidationSchemasFunctionName(scope) {
    return applyEntityNameCase(`register ${scope} validation schemas`, 'camelCase');
}
export function generateModels({ extractedTags, validationContext, modelsConfig: { filenameFormat, relativeDirPath = defaultModelsRelativeDirPath, defaultScope = 'common', generateName, generateJsDoc } = {}, commonValidationSchemaStorage, binaryTypes, jsDocRenderConfig, commentsConfig }) {
    const files = [];
    const modelsIndex = {};
    const schemaInfos = {};
    function processTag(tagName, paths) {
        const schemas = [];
        for (const pathSchema of Object.values(paths)) {
            for (const method of openApiHttpMethods) {
                if (!Object.prototype.hasOwnProperty.call(pathSchema, method)) {
                    continue;
                }
                const operation = pathSchema[method];
                for (const parameter of operation.parameters ?? []) {
                    if (parameter.schema) {
                        schemas.push(parameter.schema);
                    }
                }
                for (const mediaType of Object.values(operation.requestBody?.content ?? {})) {
                    if (mediaType.schema) {
                        schemas.push(mediaType.schema);
                    }
                }
                for (const response of Object.values(operation.responses ?? {})) {
                    for (const mediaType of Object.values(response.content ?? {})) {
                        if (mediaType.schema) {
                            schemas.push(mediaType.schema);
                        }
                    }
                }
            }
        }
        function collectDependenciesFor(name, schema) {
            if (schemaInfos[name]) {
                schemaInfos[name].tagNames.add(tagName);
                return;
            }
            schemaInfos[name] = {
                dependencies: [],
                tagNames: new Set([tagName]),
                schema
            };
            for (const [depName, depSchema] of Object.entries(collectSchemaDependencies(schema))) {
                schemaInfos[name].dependencies.push(depName);
                collectDependenciesFor(depName, depSchema);
            }
        }
        function collectAllDependencies(schemas) {
            for (const [name, schema] of Object.entries(collectSchemaDependencies({ oneOf: schemas }))) {
                collectDependenciesFor(name, schema);
            }
        }
        collectAllDependencies(schemas);
    }
    for (const [tagName, paths] of Object.entries(extractedTags.taggedPaths)) {
        processTag(tagName, paths);
    }
    function getModelName(schemaName) {
        const suggestedName = applyEntityNameCase(schemaName, 'pascalCase');
        return generateName
            ? generateName({
                suggestedName,
                schemaName
            })
            : suggestedName;
    }
    processTag(defaultScope, extractedTags.rest);
    const finalSchemaInfos = {};
    for (const [schemaName, { dependencies, tagNames, schema }] of Object.entries(schemaInfos)) {
        const scope = tagNames.size > 1 ? defaultScope : tagNames.values().next().value;
        const modelName = getModelName(schemaName);
        finalSchemaInfos[schemaName] = {
            schemaName,
            modelName,
            dependencies,
            schema,
            scope
        };
    }
    const schemasByScopes = R.groupBy(({ scope }) => scope, Object.values(finalSchemaInfos).sort((a, b) => a.modelName.localeCompare(b.modelName)));
    const validationSchemaStorageArgumentName = 'validationSchemaStorage';
    for (const [scope, fileSchemaInfos] of Object.entries(schemasByScopes)) {
        const modelRegisterValidationSchemaImports = {};
        const filename = path.join('.', relativeDirPath, formatFilename(scope, { ...filenameFormat, extension: '.ts' }));
        const dependencyImports = {};
        const exports = [];
        const validationStatements = [];
        const importPath = path.join(relativeDirPath, formatFilename(scope, filenameFormat));
        let registerValidationSchemasImportName = undefined;
        if (validationContext) {
            registerValidationSchemasImportName = generateRegisterValidationSchemasFunctionName(scope);
        }
        for (const { dependencies, modelName, schemaName, schema } of fileSchemaInfos) {
            for (const dependency of dependencies) {
                const depInfo = finalSchemaInfos[dependency];
                if (depInfo.scope === scope) {
                    continue;
                }
                const depPath = getRelativeImportPath(filename, path.join(relativeDirPath, formatFilename(depInfo.scope, filenameFormat)));
                addDependencyImport(dependencyImports, depPath, depInfo.modelName, {
                    kind: 'type',
                    entity: { name: depInfo.modelName }
                });
                if (validationContext) {
                    const registerFunctionName = generateRegisterValidationSchemasFunctionName(depInfo.scope);
                    addDependencyImport(dependencyImports, depPath, registerFunctionName, {
                        kind: 'value',
                        entity: { name: registerFunctionName }
                    });
                    modelRegisterValidationSchemaImports[registerFunctionName] = true;
                }
            }
            exports.push(extendDependenciesAndGetResult(generateTypeExport({
                modelName,
                schemaName,
                getModelName,
                schema,
                generateJsDoc,
                binaryTypes,
                importPath,
                jsDocRenderConfig
            }), dependencyImports));
            if (validationContext) {
                const { validationProvider } = validationContext;
                validationStatements.push(expressionStatement(callExpression(memberExpression(identifier(validationSchemaStorageArgumentName), identifier('register')), [
                    stringLiteral(modelName),
                    extendDependenciesAndGetResult(validationProvider.generateSetModelNameCall(extendDependenciesAndGetResult(validationProvider.generateSchema(schema, {
                        getNamedSchemaReference: (name) => callExpression(memberExpression(identifier(validationSchemaStorageArgumentName), identifier('lazy')), [stringLiteral(getModelName(name))])
                    }), dependencyImports), modelName), dependencyImports)
                ])));
            }
            modelsIndex[schemaName] = {
                modelName,
                schemaName,
                importPath,
                registerValidationSchemasImportName
            };
        }
        const otherStatements = [];
        if (Object.keys(modelRegisterValidationSchemaImports).length > 0 && validationContext) {
            validationStatements.push(expressionStatement(callExpression(memberExpression(identifier(validationContext.validationSchemaStorageImportName), identifier('registerOnce')), [
                arrayExpression(Object.keys(modelRegisterValidationSchemaImports).map((registerCallbackName) => identifier(registerCallbackName)))
            ])));
        }
        if (commonValidationSchemaStorage && registerValidationSchemasImportName && validationContext) {
            addDependencyImport(dependencyImports, getRelativeImportPath(importPath, commonValidationSchemaStorage.importPath), commonValidationSchemaStorage.className, {
                kind: 'type',
                entity: { name: commonValidationSchemaStorage.className }
            });
            otherStatements.push(exportNamedDeclaration(functionDeclaration(identifier(registerValidationSchemasImportName), [
                attachTypeAnnotation(identifier(validationSchemaStorageArgumentName), tsTypeAnnotation(tsTypeReference(identifier(commonValidationSchemaStorage.className), tsTypeParameterInstantiation([
                    extendDependenciesAndGetResult(validationContext.validationProvider.getSchemaType(), dependencyImports)
                ]))))
            ], blockStatement(validationStatements))));
        }
        files.push({
            filename,
            data: renderTypeScript(program([...generateTsImports(dependencyImports), ...exports, ...otherStatements]), commentsConfig)
        });
    }
    return { files, modelsIndex };
}

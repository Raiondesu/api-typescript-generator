import { booleanLiteral, callExpression, expressionStatement, identifier, memberExpression, numericLiteral, objectExpression, objectProperty, stringLiteral, thisExpression, tsLiteralType, tsPropertySignature, tsQualifiedName, tsTypeAnnotation, tsTypeLiteral, tsTypeParameterInstantiation, tsTypeReference, tsUnionType, tsUnknownKeyword, tsVoidKeyword } from '@babel/types';
import { addDependencyImport, extendDependenciesAndGetResult, generateSchemaTypeAndImports } from '../../utils/dependencies';
import { extractJsDoc, renderJsDocAsPlainText, renderJsDocList } from '../../utils/jsdoc';
import { isJsonMediaType } from '../../utils/media-types';
import { getRelativeImportPath } from '../../utils/paths';
import { applyEntityNameCase, ucFirst } from '../../utils/string-utils';
import { getUserFreiendlySchemaName, simplifyUnionTypeIfPossible } from '../../utils/type-utils';
const combineResultWrappers = (wrappers) => (expression) => {
    let result = expression;
    for (const wrapper of wrappers) {
        result = wrapper(result);
    }
    return result;
};
export function getOperationReturnType({ operation, getModelData, operationImportPath, commonHttpClientImportName, validationContext, serviceName, makeResponseValidationSchemasExtensible, binaryType }) {
    const modelRegisterValidationSchemaImports = {};
    const validationStatements = [];
    const getResponseBody = (expression) => callExpression(memberExpression(expression, identifier('then')), [
        memberExpression(identifier(commonHttpClientImportName), identifier('getBody'))
    ]);
    const discardResponseType = (expression) => callExpression(memberExpression(expression, identifier('then')), [
        memberExpression(identifier(commonHttpClientImportName), identifier('discardResult'))
    ]);
    const applyCreatedResultTypeShortcut = (keyCreated, keyOther) => (expression) => callExpression(memberExpression(expression, identifier('then')), [
        callExpression(memberExpression(identifier(commonHttpClientImportName), identifier('asCreatedResponse')), [
            stringLiteral(keyCreated),
            ...(keyCreated === keyOther ? [] : [stringLiteral(keyOther)])
        ])
    ]);
    const castResponseType = (responseType) => (expression) => {
        const castCall = callExpression(memberExpression(identifier(commonHttpClientImportName), identifier('castResponse')), []);
        castCall.typeParameters = tsTypeParameterInstantiation([responseType]);
        return callExpression(memberExpression(expression, identifier('then')), [castCall]);
    };
    const responseHandler = (mediaTypesDistribution) => (expression) => callExpression(memberExpression(expression, identifier('then')), [
        callExpression(memberExpression(callExpression(memberExpression(thisExpression(), identifier('getClientInstance')), []), identifier('responseHandler')), [
            objectExpression(Object.entries(mediaTypesDistribution).map(([status, mediaTypes]) => objectProperty(numericLiteral(parseInt(status, 10)), objectExpression(Object.entries(mediaTypes).map(([mediaType, bodyType]) => objectProperty(stringLiteral(mediaType), stringLiteral(bodyType)))))))
        ])
    ]);
    if (!operation.responses) {
        return {
            type: tsVoidKeyword(),
            dependencyImports: {},
            suggestedDescription: '',
            wrapResultExpression: discardResponseType,
            validationStatements: [],
            modelRegisterValidationSchemaImports: {}
        };
    }
    const successfulResponses = [];
    const statuses = {};
    const mediaTypeSchemas = {};
    const dependencyImports = {};
    const mediaTypesDistribution = {};
    for (const [status, response] of Object.entries(operation.responses ?? [])) {
        if (status.charAt(0) === '2') {
            mediaTypeSchemas[status] = {};
            statuses[status] = true;
            mediaTypesDistribution[status] = {};
            for (const [mediaTypeString, mediaType] of Object.entries(response.content ?? [])) {
                mediaTypesDistribution[status][mediaTypeString] = isJsonMediaType(mediaTypeString)
                    ? 'json'
                    : binaryType;
                successfulResponses.push({ status, mediaTypeString, response, mediaType });
                if (validationContext) {
                    const { validationSchemaStorageImportName } = validationContext;
                    if (mediaType.schema === undefined) {
                        mediaTypeSchemas[status][mediaTypeString] = null;
                    }
                    else {
                        mediaTypeSchemas[status][mediaTypeString] = extendDependenciesAndGetResult(validationContext.validationProvider.generateSchema(mediaType.schema, {
                            getNamedSchemaReference(name) {
                                const modelData = getModelData(name);
                                if (modelData.registerValidationSchemasImportName) {
                                    addDependencyImport(dependencyImports, getRelativeImportPath(operationImportPath, modelData.importPath), modelData.registerValidationSchemasImportName, {
                                        kind: 'value',
                                        entity: { name: modelData.registerValidationSchemasImportName }
                                    });
                                    modelRegisterValidationSchemaImports[modelData.registerValidationSchemasImportName] = true;
                                }
                                return callExpression(memberExpression(identifier(validationSchemaStorageImportName), identifier('lazy')), [stringLiteral(modelData.modelName)]);
                            }
                        }), dependencyImports);
                    }
                }
            }
        }
    }
    const validators = [];
    if (validationContext) {
        const { validationProvider, validationSchemaStorageImportName, validationSchemaStorageImportPath } = validationContext;
        const validationSchemaName = `${serviceName ? `${serviceName}.` : ''}${operation.operationId}.response`;
        validators.push((expression) => callExpression(memberExpression(expression, identifier('then')), [
            callExpression(memberExpression(callExpression(memberExpression(thisExpression(), identifier('getClientInstance')), []), identifier('validation')), [
                callExpression(memberExpression(identifier(validationSchemaStorageImportName), identifier('validator')), [stringLiteral(validationSchemaName)])
            ])
        ]));
        addDependencyImport(dependencyImports, getRelativeImportPath(operationImportPath, validationSchemaStorageImportPath), validationSchemaStorageImportName, { kind: 'value', entity: { name: validationSchemaStorageImportName } });
        validationStatements.push(expressionStatement(callExpression(memberExpression(identifier(validationSchemaStorageImportName), identifier(makeResponseValidationSchemasExtensible ? 'registerExtensible' : 'register')), [
            stringLiteral(validationSchemaName),
            extendDependenciesAndGetResult(validationProvider.generateSetModelNameCall(extendDependenciesAndGetResult(validationProvider.generateOperationResponseSchema(mediaTypeSchemas), dependencyImports), validationSchemaName), dependencyImports)
        ])));
    }
    if (successfulResponses.length === 0) {
        return {
            type: tsVoidKeyword(),
            dependencyImports: {},
            suggestedDescription: '',
            wrapResultExpression: discardResponseType,
            validationStatements: [],
            modelRegisterValidationSchemaImports: {}
        };
    }
    const resultType = tsUnionType([]);
    const suggestedDescriptionFragments = [];
    const responseType = tsUnionType([]);
    const useAsCreatedResponseShortcut = successfulResponses.length === 2 && statuses[200] && statuses[201];
    let keyCreated = 'body';
    let keyOther = 'other';
    const getBinaryType = () => tsTypeReference(identifier(ucFirst(binaryType)));
    for (const { status, mediaTypeString, mediaType, response } of successfulResponses) {
        let schemaType;
        if (isJsonMediaType(mediaTypeString)) {
            if (mediaType.schema !== undefined) {
                schemaType = extendDependenciesAndGetResult(generateSchemaTypeAndImports({
                    schema: mediaType.schema,
                    sourceImportPath: operationImportPath,
                    getModelData,
                    getBinaryType
                }), dependencyImports);
            }
            else {
                schemaType = tsUnknownKeyword();
            }
        }
        else {
            schemaType = tsTypeReference(identifier('Blob'));
        }
        if (status === '204') {
            schemaType = tsVoidKeyword();
        }
        const jsdocString = renderJsDocAsPlainText(extractJsDoc({ ...response, ...mediaType }));
        const responseOption = tsTypeLiteral([
            tsPropertySignature(identifier('status'), tsTypeAnnotation(tsLiteralType(numericLiteral(parseInt(status, 10))))),
            tsPropertySignature(identifier('mediaType'), tsTypeAnnotation(tsLiteralType(stringLiteral(mediaTypeString)))),
            tsPropertySignature(identifier('body'), tsTypeAnnotation(schemaType))
        ]);
        responseType.types.push(responseOption);
        if (successfulResponses.length > 1) {
            suggestedDescriptionFragments.push(`status: ${status}, mediaType: ${mediaTypeString}${jsdocString ? `\n\n${jsdocString}` : ''}`);
            if (useAsCreatedResponseShortcut) {
                const fieldName = applyEntityNameCase(getUserFreiendlySchemaName(mediaType.schema) ?? 'body', 'camelCase');
                const created = status === '201';
                if (created) {
                    keyCreated = fieldName;
                }
                else {
                    keyOther = fieldName;
                }
                resultType.types.push(tsTypeLiteral([
                    tsPropertySignature(identifier('created'), tsTypeAnnotation(tsLiteralType(booleanLiteral(created)))),
                    tsPropertySignature(identifier(fieldName), tsTypeAnnotation(schemaType))
                ]));
            }
            else {
                resultType.types.push(responseOption);
            }
        }
        else {
            return {
                type: schemaType,
                dependencyImports,
                suggestedDescription: jsdocString ?? '',
                wrapResultExpression: combineResultWrappers([
                    responseHandler(mediaTypesDistribution),
                    castResponseType(responseType),
                    ...validators,
                    getResponseBody
                ]),
                validationStatements,
                modelRegisterValidationSchemaImports
            };
        }
    }
    return {
        type: useAsCreatedResponseShortcut
            ? simplifyUnionTypeIfPossible(resultType)
            : tsTypeReference(tsQualifiedName(identifier(commonHttpClientImportName), identifier('WithResponse')), tsTypeParameterInstantiation([simplifyUnionTypeIfPossible(resultType)])),
        dependencyImports,
        suggestedDescription: '\n' + renderJsDocList(suggestedDescriptionFragments),
        wrapResultExpression: combineResultWrappers([
            responseHandler(mediaTypesDistribution),
            castResponseType(simplifyUnionTypeIfPossible(responseType)),
            ...validators,
            useAsCreatedResponseShortcut
                ? applyCreatedResultTypeShortcut(keyCreated, keyOther)
                : (expression) => expression
        ]),
        validationStatements,
        modelRegisterValidationSchemaImports
    };
}

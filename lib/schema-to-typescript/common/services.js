import path from 'path';
import { blockStatement, classBody, classDeclaration, classMethod, exportNamedDeclaration, identifier, importDeclaration, importNamespaceSpecifier, importSpecifier, program, stringLiteral } from '@babel/types';
import { generateOperationMethods } from './operation-methods';
import { openApiHttpMethods } from '../../schemas/openapi';
import { makeProtected } from '../../utils/ast';
import { generateTsImports } from '../../utils/dependencies';
import { attachJsDocComment, renderJsDoc } from '../../utils/jsdoc';
import { getRelativeImportPath } from '../../utils/paths';
import { applyEntityNameCase, formatFilename } from '../../utils/string-utils';
import { renderTypeScript } from '../common';
const defaultServiceFilenameFormat = {
    postfix: '-service',
    filenameCase: 'kebabCase'
};
export const defaultServicesRelativeDirPath = 'services';
export function generateServices({ taggedPaths, tags, commonHttpClientImportPath, commonHttpServiceImportPath, commonHttpServiceClassName, servicesConfig: { filenameFormat, relativeDirPath = defaultServicesRelativeDirPath, generateName, generateJsDoc } = {}, operationsConfig, getModelData, validationContext, binaryTypes, jsDocRenderConfig, commentsConfig }) {
    const commonHttpClientImportName = 'commonHttpClient';
    const files = [];
    const services = [];
    const deprecatedOperations = {};
    for (const [tag, paths] of Object.entries(taggedPaths)) {
        const importPath = path.join(relativeDirPath, formatFilename(tag, { ...defaultServiceFilenameFormat, ...filenameFormat }));
        const suggestedName = applyEntityNameCase(tag + '-service', 'pascalCase');
        const serviceName = generateName
            ? generateName({
                suggestedName,
                tag: tags[tag] ?? { name: tag },
                paths
            })
            : suggestedName;
        let jsdoc = {
            description: tags[tag]?.description,
            tags: []
        };
        if (Object.values(paths).every((path) => openApiHttpMethods.every((method) => !path[method] || path[method]?.deprecated))) {
            jsdoc.tags.push({ name: 'deprecated' });
        }
        if (generateJsDoc) {
            jsdoc = generateJsDoc({
                suggestedJsDoc: jsdoc,
                serviceName,
                tag: tags[tag] ?? { name: tag },
                paths
            });
        }
        services.push({
            name: serviceName,
            tag,
            importPath,
            jsdoc
        });
        const serviceMethods = generateOperationMethods({
            paths,
            serviceName,
            operationsConfig,
            getModelData,
            validationContext,
            commonHttpClientImportName,
            operationImportPath: importPath,
            binaryTypes,
            jsDocRenderConfig
        });
        const serviceClassBody = classBody([...serviceMethods.methods]);
        Object.assign(deprecatedOperations, Object.fromEntries(Object.entries(serviceMethods.deprecatedOperations).map(([methodAndPath, operationName]) => [
            methodAndPath,
            `${applyEntityNameCase(tag, 'camelCase')}.${operationName}`
        ])));
        if (serviceMethods.validationStatements.length > 0) {
            serviceClassBody.body.push(makeProtected(classMethod('method', identifier('initialize'), [], blockStatement(serviceMethods.validationStatements), false, true)));
        }
        const classObj = classDeclaration(identifier(serviceName), identifier(commonHttpServiceClassName), serviceClassBody);
        const imports = [
            importDeclaration([importNamespaceSpecifier(identifier(commonHttpClientImportName))], stringLiteral(getRelativeImportPath(importPath, commonHttpClientImportPath))),
            importDeclaration([importSpecifier(identifier(commonHttpServiceClassName), identifier(commonHttpServiceClassName))], stringLiteral(getRelativeImportPath(importPath, commonHttpServiceImportPath))),
            ...generateTsImports(serviceMethods.dependencyImports)
        ];
        files.push({
            filename: path.join(relativeDirPath, formatFilename(tag, { ...defaultServiceFilenameFormat, ...filenameFormat, extension: '.ts' })),
            data: renderTypeScript(program([
                ...imports,
                attachJsDocComment(exportNamedDeclaration(classObj), renderJsDoc(jsdoc, jsDocRenderConfig))
            ]), commentsConfig)
        });
    }
    return { files, services, deprecatedOperations };
}

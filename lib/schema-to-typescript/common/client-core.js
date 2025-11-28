import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { isClassAccessorProperty, isClassDeclaration, isClassMethod, isClassProperty, isExportNamedDeclaration, isImportDeclaration, isIdentifier } from '@babel/types';
import { attachJsDocComment, isJsDocComment, parseJsDoc, renderJsDoc } from '../../utils/jsdoc';
import { formatFilename } from '../../utils/string-utils';
import { renderTypeScript } from '../common';
function updateJsDoc({ typeName, memberName, node, generateJsDoc }) {
    const jsDocComment = node.leadingComments?.find(isJsDocComment);
    attachJsDocComment(node, renderJsDoc(generateJsDoc({
        typeName,
        memberName,
        suggestedJsDoc: jsDocComment ? parseJsDoc(jsDocComment.value) : { tags: [] }
    })));
}
function removeTrailingComments(parseResult) {
    traverse(parseResult, {
        exit(path) {
            if (path.node.trailingComments) {
                path.node.trailingComments = [];
            }
        }
    });
}
function processCoreFile(code, filenameFormat, commentsConfig, generateJsDoc) {
    const parseResult = parse(code, {
        sourceType: 'module',
        plugins: ['typescript']
    });
    removeTrailingComments(parseResult);
    const program = parseResult.program;
    for (const statement of program.body) {
        if (isImportDeclaration(statement)) {
            if (!statement.source.value.startsWith('./')) {
                throw new Error(`Unexpected import path: ${statement.source.value}`);
            }
            statement.source.value = `./${formatFilename(statement.source.value.slice(2), filenameFormat)}`;
        }
        if (generateJsDoc) {
            if (isExportNamedDeclaration(statement)) {
                if (isClassDeclaration(statement.declaration)) {
                    const classDeclaration = statement.declaration;
                    if (!classDeclaration.id?.name) {
                        throw new Error('Unexpected class declaration without name.');
                    }
                    updateJsDoc({ node: statement, typeName: classDeclaration.id?.name, generateJsDoc });
                    for (const member of classDeclaration.body.body) {
                        if (isClassMethod(member) || isClassProperty(member) || isClassAccessorProperty(member)) {
                            if (!isIdentifier(member.key)) {
                                throw new Error('Unexpected member without key.');
                            }
                            updateJsDoc({
                                node: member,
                                typeName: classDeclaration.id.name,
                                memberName: member.key.name,
                                generateJsDoc
                            });
                        }
                    }
                }
            }
        }
    }
    return renderTypeScript(JSON.parse(JSON.stringify(program)), commentsConfig);
}
export const defaultCoreRelativeDirPath = 'core';
export async function generateCommonHttpClient({ filenameFormat, relativeDirPath = defaultCoreRelativeDirPath, generateJsDoc } = {}, commentsConfig) {
    return {
        className: 'CommonHttpClient',
        classOptionsName: 'CommonHttpClientOptions',
        errorClassName: 'CommonHttpClientError',
        importPath: path.join(relativeDirPath, formatFilename('common-http-client', filenameFormat)),
        file: {
            filename: path.join(relativeDirPath, formatFilename('common-http-client', { ...filenameFormat, extension: '.ts' })),
            data: processCoreFile(await fs.promises.readFile(path.join(__dirname, 'core', 'common-http-client.ts'), 'utf8'), filenameFormat, commentsConfig, generateJsDoc)
        }
    };
}
export async function generateCommonHttpService({ filenameFormat, relativeDirPath = defaultCoreRelativeDirPath, generateJsDoc } = {}, commentsConfig) {
    return {
        importPath: path.join(relativeDirPath, formatFilename('common-http-service', filenameFormat)),
        className: 'CommonHttpService',
        file: {
            filename: path.join(relativeDirPath, `${formatFilename('common-http-service', { ...filenameFormat, extension: '.ts' })}`),
            data: processCoreFile(await fs.promises.readFile(path.join(__dirname, 'core', 'common-http-service.ts'), 'utf8'), filenameFormat, commentsConfig, generateJsDoc)
        }
    };
}
export async function generateCommonValidationSchemaStorage({ filenameFormat, relativeDirPath = defaultCoreRelativeDirPath, generateJsDoc } = {}, commentsConfig) {
    return {
        importPath: path.join(relativeDirPath, formatFilename('common-validation-schema-storage', filenameFormat)),
        className: 'CommonValidationSchemaStorage',
        file: {
            filename: path.join(relativeDirPath, `${formatFilename('common-validation-schema-storage', { ...filenameFormat, extension: '.ts' })}`),
            data: processCoreFile(await fs.promises.readFile(path.join(__dirname, 'core', 'common-validation-schema-storage.ts'), 'utf8'), filenameFormat, commentsConfig, generateJsDoc)
        }
    };
}

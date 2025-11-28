import { generateClient } from './common/client';
import { generateCommonHttpClient, generateCommonHttpService, generateCommonValidationSchemaStorage } from './common/client-core';
import { generateModels } from './common/models';
import { generateServices } from './common/services';
import { ZodValidationProvider } from './common/validation-providers/zod-validation-provider';
import { generateValidationSchemaStorage } from './common/validation-schema-storage';
import { extractTags } from '../utils/tags';
const validationProviders = {
    zod: new ZodValidationProvider()
};
export async function openapiToTypescriptClient({ document, generateConfig }) {
    const extractedTags = generateConfig.services !== false
        ? extractTags(document)
        : { taggedPaths: {}, rest: { ...document.paths }, tags: {} };
    const files = [];
    const [commonHttpClient, commonHttpService, commonValidationSchemaStorage] = await Promise.all([
        generateCommonHttpClient(generateConfig.core, generateConfig.comments),
        generateCommonHttpService(generateConfig.core, generateConfig.comments),
        generateConfig.validation
            ? generateCommonValidationSchemaStorage(generateConfig.core, generateConfig.comments)
            : undefined
    ]);
    let validationContext;
    if (generateConfig.validation && commonValidationSchemaStorage) {
        const validationProvider = validationProviders[generateConfig.validation.library];
        const validationSchemaStorage = await generateValidationSchemaStorage({
            commonValidationSchemaStorage: commonValidationSchemaStorage,
            validationProvider,
            validationConfig: generateConfig.validation,
            commentsConfig: generateConfig.comments
        });
        files.push(validationSchemaStorage.file);
        validationContext = {
            validationProvider,
            validationSchemaStorageImportName: validationSchemaStorage.importName,
            validationSchemaStorageImportPath: validationSchemaStorage.importPath
        };
    }
    const binaryTypes = generateConfig.binaryTypes ?? ['blob', 'readableStream'];
    const generatedModels = generateModels({
        extractedTags,
        validationContext,
        modelsConfig: generateConfig.models,
        commonValidationSchemaStorage,
        binaryTypes,
        jsDocRenderConfig: generateConfig.jsDoc,
        commentsConfig: generateConfig.comments
    });
    files.push(commonHttpClient.file, commonHttpService.file);
    if (commonValidationSchemaStorage) {
        files.push(commonValidationSchemaStorage.file);
    }
    files.push(...generatedModels.files);
    const getModelData = (schemaName) => {
        const modelData = generatedModels.modelsIndex[schemaName];
        if (!modelData) {
            throw new Error(`Could not find corresponding model for schema "${schemaName}".`);
        }
        return modelData;
    };
    let generatedServices;
    if (generateConfig.services !== false) {
        generatedServices = generateServices({
            taggedPaths: extractedTags.taggedPaths,
            tags: extractedTags.tags,
            servicesConfig: generateConfig.services,
            commonHttpClientImportPath: commonHttpClient.importPath,
            commonHttpServiceImportPath: commonHttpService.importPath,
            commonHttpServiceClassName: commonHttpService.className,
            operationsConfig: generateConfig.operations,
            getModelData,
            validationContext,
            binaryTypes,
            jsDocRenderConfig: generateConfig.jsDoc,
            commentsConfig: generateConfig.comments
        });
        files.push(...generatedServices.files);
    }
    if (generateConfig.client !== false) {
        files.push(generateClient({
            commonHttpClientClassName: commonHttpClient.className,
            commonHttpClientClassOptionsName: commonHttpClient.classOptionsName,
            commonHttpClientErrorClassName: commonHttpClient.errorClassName,
            commonHttpClientImportPath: commonHttpClient.importPath,
            commonHttpServiceImportPath: commonHttpService.importPath,
            commonHttpServiceClassName: commonHttpService.className,
            clientConfig: generateConfig.client,
            generatedServiceImports: generatedServices?.services ?? [],
            servers: document.servers ?? [],
            info: document.info,
            paths: extractedTags.rest,
            operationsConfig: generateConfig.operations,
            getModelData,
            modelImportInfos: Object.values(generatedModels.modelsIndex),
            validationContext,
            responseBinaryType: generateConfig.operations?.responseBinaryType ?? 'blob',
            binaryTypes,
            jsDocRenderConfig: generateConfig.jsDoc,
            commentsConfig: generateConfig.comments,
            deprecatedOperations: generatedServices?.deprecatedOperations ?? {}
        }));
    }
    return { files };
}

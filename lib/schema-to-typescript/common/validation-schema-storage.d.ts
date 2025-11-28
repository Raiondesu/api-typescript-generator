import { ValidationProvider } from './validation-providers/validation-provider';
import { CommentsRenderConfig } from '../common';
import { ClientGenerationResultFile } from '../config';
import { OpenApiClientGeneratorConfig } from '../openapi-to-typescript-client';
export declare function generateValidationSchemaStorage({ commonValidationSchemaStorage, validationProvider, validationConfig: { validationSchemaStorage: { exportName, ...filenameFormatConfig } }, commentsConfig }: {
    commonValidationSchemaStorage: {
        importPath: string;
        className: string;
    };
    validationConfig: Exclude<OpenApiClientGeneratorConfig['validation'], undefined>;
    validationProvider: ValidationProvider;
    commentsConfig: CommentsRenderConfig;
}): Promise<{
    importPath: string;
    importName: string;
    file: ClientGenerationResultFile;
}>;

import { CommentsRenderConfig } from '../common';
import { ClientGenerationResultFile } from '../config';
export declare const defaultCoreRelativeDirPath = "core";
export declare function generateCommonHttpClient({ filenameFormat, relativeDirPath, generateJsDoc }: import("../openapi-to-typescript-client").OpenApiClientGeneratorConfigCore | undefined, commentsConfig: CommentsRenderConfig): Promise<{
    importPath: string;
    className: string;
    classOptionsName: string;
    errorClassName: string;
    file: ClientGenerationResultFile;
}>;
export declare function generateCommonHttpService({ filenameFormat, relativeDirPath, generateJsDoc }: import("../openapi-to-typescript-client").OpenApiClientGeneratorConfigCore | undefined, commentsConfig: CommentsRenderConfig): Promise<{
    importPath: string;
    className: string;
    file: ClientGenerationResultFile;
}>;
export declare function generateCommonValidationSchemaStorage({ filenameFormat, relativeDirPath, generateJsDoc }: import("../openapi-to-typescript-client").OpenApiClientGeneratorConfigCore | undefined, commentsConfig: CommentsRenderConfig): Promise<{
    importPath: string;
    className: string;
    file: ClientGenerationResultFile;
}>;

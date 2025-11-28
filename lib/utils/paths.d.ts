import { FilenameFormat } from './string-utils';
export declare function getRelativeImportPath(from: string, to: string): string;
export declare function getFilenameAndImportPath(entityName: string, config: {
    filename?: string;
    filenameFormat?: FilenameFormat;
    relativeDirPath?: string;
}): {
    filename: string;
    importPath: string;
};
export declare function isRelativeImportPath(importPath: string): boolean;

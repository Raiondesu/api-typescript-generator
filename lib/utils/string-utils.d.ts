export declare function ucFirst(input: string): string;
export declare function lcFirst(input: string): string;
export type EntityNameCase = 'kebabCase' | 'camelCase' | 'snakeCase' | 'pascalCase';
export interface FilenameFormat {
    filenameCase?: EntityNameCase;
    prefix?: string;
    postfix?: string;
    extension?: string;
}
export declare function applyEntityNameCase(input: string, entityNameCase: EntityNameCase): string;
export declare function formatFilename(input: string, { filenameCase, extension, postfix, prefix }?: FilenameFormat | undefined): string;
export declare function rTrim(input: string): string;
export declare function wordWrap(input: string, lineWidth: number): string;

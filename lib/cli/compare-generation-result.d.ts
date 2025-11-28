import { ClientGenerationResultFile } from '../schema-to-typescript/config';
export declare function compareGenerationResult({ files, outputDirPath, cleanupDirectories }: {
    files: ClientGenerationResultFile[];
    outputDirPath: string;
    cleanupDirectories: string[];
}): Promise<boolean>;

import { ClientGenerationResultFile } from '../schema-to-typescript/config';
export declare function saveGenerationResult({ files, outputDirPath, cleanupDirectories }: {
    files: ClientGenerationResultFile[];
    outputDirPath: string;
    cleanupDirectories: string[];
}): Promise<void>;

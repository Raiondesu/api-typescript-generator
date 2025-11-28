import { TSType } from '@babel/types';
import { DependencyImports } from '../../utils/dependencies';
import { OpenApiClientCustomizableBinaryType } from '../openapi-to-typescript-client';
export declare function generateBinaryType(config: OpenApiClientCustomizableBinaryType[], basePath: string): {
    result: TSType;
    dependencyImports: DependencyImports;
};

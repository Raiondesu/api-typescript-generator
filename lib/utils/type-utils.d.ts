import { TSIntersectionType, TSType, TSUnionType } from '@babel/types';
import { OpenApiSchema } from '../schemas/common';
export declare function simplifyUnionTypeIfPossible(union: TSUnionType): TSType;
export declare function getUserFreiendlySchemaName(schema: OpenApiSchema | undefined): string | undefined;
export declare function mergeTypes(first: TSType, second: TSType): TSType;
export declare function simplifyIntersectionTypeIfPossible(intersection: TSIntersectionType): TSType;
export declare function isAssignableToEmptyObject(type: TSType): boolean;

import { ObjectExpression } from '@babel/types';
import { OpenApiParameter } from '../schemas/common';
export declare function buildParametersSerializationInfo(parameters: OpenApiParameter[]): ObjectExpression | null;

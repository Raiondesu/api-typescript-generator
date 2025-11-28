import { Expression, Identifier, Noop, NumericLiteral, Program, StringLiteral, TSType, TSTypeAnnotation, TypeAnnotation } from '@babel/types';
import { OpenApiClientGeneratorConfig } from './openapi-to-typescript-client';
import { OpenApiExample, OpenApiExpandedSchema, OpenApiSchema, OpenApiSchemaPrimitiveValue } from '../schemas/common';
import { JsDocBlock, JsDocRenderConfig } from '../utils/jsdoc';
export declare const stringIndexSignature: unique symbol;
export type OpenApiSchemaFieldPathItem = string | typeof stringIndexSignature;
export interface GenerateSchemaTypeParams {
    schema: OpenApiSchema;
    getTypeName: (name: string, schema: OpenApiSchema) => string;
    getBinaryType: () => TSType;
    expand?: boolean;
    processJsDoc?: (jsdoc: JsDocBlock, entity: OpenApiSchema, path: OpenApiSchemaFieldPathItem[]) => JsDocBlock;
    processJsDocPath?: OpenApiSchemaFieldPathItem[];
    jsDocRenderConfig?: JsDocRenderConfig;
}
export declare function generateSchemaType({ schema: originalSchema, getTypeName, expand, processJsDoc, processJsDocPath, getBinaryType, jsDocRenderConfig }: GenerateSchemaTypeParams): TSType;
export declare function unionTypeIfNecessary(types: TSType[]): TSType;
export declare function objectPropertyKey(id: string | number): Identifier | StringLiteral | NumericLiteral;
export interface AnnotatedApiEntity {
    title?: string;
    description?: string;
    example?: unknown;
    examples?: Record<string, OpenApiExample>;
    deprecated?: boolean;
}
export declare function primitiveValueToType(value: OpenApiSchemaPrimitiveValue): TSType;
export declare function valueToAstExpression(value: unknown): Expression;
export declare function isNamedSchema(schema: OpenApiSchema): schema is OpenApiExpandedSchema & {
    name: string;
};
export declare function attachTypeAnnotation<T extends {
    typeAnnotation?: TypeAnnotation | TSTypeAnnotation | Noop | null;
}>(node: T, typeAnnotation: TSTypeAnnotation): T;
export type CommentsRenderConfig = OpenApiClientGeneratorConfig['comments'];
export declare function renderTypeScript(node: Program, commentsConfig?: CommentsRenderConfig): string;

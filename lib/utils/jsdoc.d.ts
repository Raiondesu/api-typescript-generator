import { Node, Comment } from '@babel/types';
import { AnnotatedApiEntity } from '../schema-to-typescript/common';
import { OpenApiClientGeneratorConfig } from '../schema-to-typescript/openapi-to-typescript-client';
export interface JsDocBlock {
    title?: string;
    description?: string;
    tags: JsDocBlockTag[];
}
export interface JsDocBlockTag {
    name: string;
    value?: string;
}
export declare function extractJsDoc(entity: AnnotatedApiEntity | boolean): JsDocBlock;
export declare function renderJsDocList(items: string[]): string;
export declare function renderJsDocAsPlainText(jsdoc: JsDocBlock): string | null;
export type JsDocRenderConfig = OpenApiClientGeneratorConfig['jsDoc'];
export declare function renderJsDoc(jsdoc: JsDocBlock, config?: JsDocRenderConfig): string | null;
export declare function attachJsDocComment<T extends Node>(node: T, jsdoc: string | null): T;
export declare function extractJsDocString(entity: AnnotatedApiEntity | boolean, params?: JsDocBlockTag[]): string | null;
export declare function isJsDocComment(node: Comment): boolean;
export declare function parseJsDoc(comment: string): JsDocBlock;

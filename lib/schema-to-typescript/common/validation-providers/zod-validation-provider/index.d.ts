import { Expression } from '@babel/types';
import { OpenApiSchema } from '../../../../schemas/common';
import { DependencyImports } from '../../../../utils/dependencies';
import { ResultWithDependencyImports, ValidationProvider, ValidationProviderContext } from '../validation-provider';
export declare class ZodValidationProvider extends ValidationProvider {
    getSchemaType(): {
        result: import("@babel/types").TSTypeReference;
        dependencyImports: DependencyImports;
    };
    withDependencyImports<T>(result: T): {
        result: T;
        dependencyImports: DependencyImports;
    };
    generateSchema(schema: OpenApiSchema, context: ValidationProviderContext): ResultWithDependencyImports<Expression>;
    protected generateSchemaItem(originalSchema: OpenApiSchema, context: ValidationProviderContext): Expression;
    generateLazyGetter(expression: Expression): {
        result: import("@babel/types").CallExpression;
        dependencyImports: DependencyImports;
    };
    generateAssertCall(validationSchema: Expression, data: Expression): {
        result: import("@babel/types").CallExpression;
        dependencyImports: DependencyImports;
    };
    generateSetModelNameCall(validationSchema: Expression, modelName: string): ResultWithDependencyImports<Expression>;
    generateOperationResponseSchema(responses: {
        [statusCode: string]: {
            [mediaType: string]: Expression | null;
        };
    }): {
        result: import("@babel/types").CallExpression;
        dependencyImports: DependencyImports;
    };
    generateMakeExtensibleCallback(): Promise<ResultWithDependencyImports<Expression>>;
    generateFormatErrorMessageCallback(): Promise<ResultWithDependencyImports<Expression>>;
}

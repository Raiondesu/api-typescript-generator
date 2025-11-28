import * as R from 'ramda';
export function isOpenApiDocument(document) {
    return typeof document === 'object' && document !== null && 'openapi' in document;
}
export const openApiHttpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
export function processOpenApiDocument(document) {
    const openApiDocument = R.clone(document);
    if (openApiDocument.components && openApiDocument.components.schemas) {
        for (const [name, schema] of Object.entries(openApiDocument.components.schemas)) {
            if (typeof schema !== 'boolean') {
                schema.name = name;
            }
        }
    }
    if (openApiDocument.paths) {
        for (const path of Object.values(openApiDocument.paths)) {
            if (path.parameters) {
                for (const method of openApiHttpMethods) {
                    const operation = path[method];
                    if (operation) {
                        operation.parameters = (operation.parameters ?? []).concat(path.parameters);
                    }
                }
            }
        }
    }
    return openApiDocument;
}

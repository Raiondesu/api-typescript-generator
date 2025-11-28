async function patch(document, path, patch) {
    let currentObject = document;
    for (const key of path.slice(0, -1)) {
        currentObject = currentObject[key];
        if (currentObject === undefined || currentObject === null) {
            throw new Error(`Path ${path.join('/')} does not exist`);
        }
        if (typeof currentObject !== 'object' || currentObject === null) {
            throw new Error(`Path ${path.join('/')} is not an object`);
        }
    }
    const lastPathItem = path[path.length - 1];
    currentObject[lastPathItem] = (await patch(currentObject[lastPathItem]));
    return document;
}
export async function patchOpenApiDocument(document, config) {
    let result = document;
    if (config.patchPaths) {
        if (typeof config.patchPaths === 'function') {
            result = await patch(result, ['paths'], config.patchPaths);
        }
        else {
            for (const [path, pathItemPatch] of Object.entries(config.patchPaths)) {
                if (typeof pathItemPatch === 'function') {
                    result = await patch(result, ['paths', path], (pathItem) => pathItemPatch(pathItem, path));
                }
                else {
                    for (const [method, methodPatch] of Object.entries(pathItemPatch)) {
                        result = await patch(result, ['paths', path, method], (operation) => methodPatch(operation, path, method));
                    }
                }
            }
        }
    }
    if (config.patchTags) {
        result = await patch(result, ['tags'], config.patchTags);
    }
    if (config.patchSchemas) {
        if (typeof config.patchSchemas === 'function') {
            result = await patch(result, ['components', 'schemas'], config.patchSchemas);
        }
        else {
            for (const [schemaName, schemaPatch] of Object.entries(config.patchSchemas)) {
                result = await patch(result, ['components', 'schemas', schemaName], (schema) => schemaPatch(schema, schemaName));
            }
        }
    }
    if (config.patchDocument) {
        result = await config.patchDocument(result);
    }
    return result;
}

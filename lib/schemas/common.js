export function extendSchema(base, extension) {
    if (extension === true || base === true) {
        return true;
    }
    if (extension === false || base === false) {
        return false;
    }
    const result = Object.assign({}, base, extension);
    if (base.properties && extension.properties) {
        result.properties = { ...base.properties, ...extension.properties };
    }
    if (base.required && extension.required) {
        result.required = base.required.concat(extension.required);
    }
    if (base.additionalProperties && extension.additionalProperties) {
        result.additionalProperties = extendSchema(base.additionalProperties, extension.additionalProperties);
    }
    if (base.examples && extension.examples) {
        result.examples = { ...base.examples, ...extension.examples };
    }
    if (base.externalDocumentation && extension.externalDocumentation) {
        result.externalDocumentation = { ...base.externalDocumentation, ...extension.externalDocumentation };
    }
    return result;
}
export function resolveDocumentReferences(document) {
    const alreadyResolved = new Set();
    function queryDocument(path) {
        let current = document;
        for (const pathBit of path.split('/')) {
            current = current[pathBit];
            if (current === undefined) {
                throw new Error(`Could not find schema object by path "${path}".`);
            }
        }
        return current;
    }
    function resolveReferences(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        const ref = obj.$ref;
        if (ref) {
            if (!ref.startsWith('#/')) {
                throw new Error(`Could not resolve reference ${JSON.stringify(ref)}. Only local refs are supported.`);
            }
            return queryDocument(ref.slice(2));
        }
        if (alreadyResolved.has(obj)) {
            return obj;
        }
        alreadyResolved.add(obj);
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                obj[i] = resolveReferences(obj[i]);
            }
        }
        for (const [key, value] of Object.entries(obj)) {
            obj[key] = resolveReferences(value);
        }
        return obj;
    }
    return resolveReferences(document);
}

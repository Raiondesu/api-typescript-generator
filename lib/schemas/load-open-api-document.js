import { resolveDocumentReferences } from './common';
import { fetchSource } from './fetch-source';
import { processOpenApiDocument } from './openapi';
import { patchOpenApiDocument } from './patch-open-api-document';
export async function loadOpenApiDocument(config) {
    let document = (await fetchSource(config.source));
    if (config.patch) {
        document = await patchOpenApiDocument(document, config.patch);
    }
    document = resolveDocumentReferences(processOpenApiDocument(document));
    return document;
}

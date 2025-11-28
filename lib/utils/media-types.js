const jsonMediaTypeTypeRegExp = /^application\/(\w+\+)?json/;
export function isJsonMediaType(mediaType) {
    return Boolean(mediaType.match(jsonMediaTypeTypeRegExp));
}
export function isWildcardMediaType(mediaType) {
    return mediaType.includes('*');
}

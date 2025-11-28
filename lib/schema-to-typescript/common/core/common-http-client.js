export class CommonHttpClientError extends Error {
    url;
    request;
    response;
    options;
    constructor(url, request, response, options, message) {
        super(message);
        this.name = 'OpenApiClientError';
        this.url = url;
        this.request = request;
        this.response = response;
        this.options = options;
    }
}
const jsonContentTypeRegExp = /^application\/(\w+\+)?json/;
function readableStreamToBlob(stream) {
    const chunks = [];
    const reader = stream.getReader();
    return new Promise((resolve, reject) => {
        reader.read().then(function process({ done, value }) {
            if (value) {
                chunks.push(value);
            }
            if (done) {
                resolve(new Blob(chunks));
                return;
            }
            reader.read().then(process, reject);
        }, reject);
    });
}
async function convertResponseBody(body, destType) {
    if (body.type === destType) {
        return body;
    }
    if (body.type === 'json') {
        const blob = new Blob([JSON.stringify(body.data)]);
        if (destType === 'blob') {
            return { type: 'blob', data: blob };
        }
        else if (destType === 'readableStream') {
            return { type: 'readableStream', data: blob.stream() };
        }
        else {
            throw new Error('Invalid destination type.');
        }
    }
    if (body.type === 'blob') {
        if (destType === 'json') {
            return { type: 'json', data: JSON.parse(await body.data.text()) };
        }
        else if (destType === 'readableStream') {
            return { type: 'readableStream', data: body.data.stream() };
        }
        else {
            throw new Error('Invalid destination type.');
        }
    }
    if (body.type === 'readableStream') {
        if (destType === 'json') {
            return { type: 'json', data: JSON.parse(await (await readableStreamToBlob(body.data)).text()) };
        }
        else if (destType === 'blob') {
            return { type: 'blob', data: await readableStreamToBlob(body.data) };
        }
        else {
            throw new Error('Invalid destination type.');
        }
    }
    throw new Error('Invalid response body type.');
}
export function checkReponseMediaType(response, mediaType) {
    return response.mediaType === mediaType;
}
export function isJsonMediaType(mediaType) {
    return Boolean(mediaType.match(jsonContentTypeRegExp));
}
export function asCreatedResponse(...keys) {
    const keyCreated = keys[0];
    const keyOther = keys[1] ?? keyCreated;
    return (response) => {
        if (response.status === 201) {
            return {
                created: true,
                [keyCreated]: response.body
            };
        }
        else {
            return {
                created: false,
                [keyOther]: response.body
            };
        }
    };
}
export const getBody = ({ body }) => body;
export const castResponse = () => (response) => response;
export const discardResult = () => { };
export function createClientWithServices(services, options) {
    const client = new this(options);
    const extension = {};
    for (const serviceName in services) {
        if (Object.prototype.hasOwnProperty.call(services, serviceName)) {
            extension[serviceName.replace(/[^\b]Service$/, '').replace(/^\w/, (s) => s.toLowerCase())] = new services[serviceName](client.getClient());
        }
    }
    return Object.assign(client, extension);
}
function getErrorMessage(e) {
    return e instanceof Error ? e.message : String(e);
}
function parameterHasValue(value) {
    return (value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0) &&
        (typeof value !== 'object' || Object.keys(value).length > 0));
}
function parameterFormattedParameterToString({ pairs, pairSeparator = '', keyValueSeparator = '' }) {
    return pairs
        .map(({ key, value }) => (key !== undefined ? `${key}${keyValueSeparator}${value}` : value))
        .join(pairSeparator);
}
const formatParameter = {
    simple(_key, value, explode) {
        if (!parameterHasValue(value)) {
            return { pairs: [] };
        }
        if (Array.isArray(value)) {
            return { pairs: [{ value: value.join(',') }] };
        }
        if (typeof value === 'object' && value !== null) {
            return {
                pairs: [
                    {
                        value: Object.entries(value)
                            .map(([key, val]) => `${key}${explode ? '=' : ','}${val}`)
                            .join(',')
                    }
                ]
            };
        }
        return { pairs: [{ value: String(value) }] };
    },
    label(_key, value, explode) {
        if (!parameterHasValue(value)) {
            return { pairs: [{ value: '.' }] };
        }
        if (Array.isArray(value)) {
            return { pairs: [{ value: '.' + value.join('.') }] };
        }
        if (typeof value === 'object' && value !== null) {
            return {
                pairs: [
                    {
                        value: Object.entries(value)
                            .map(([key, val]) => `.${key}${explode ? '=' : '.'}${val}`)
                            .join('')
                    }
                ]
            };
        }
        return { pairs: [{ value: '.' + String(value) }] };
    },
    matrix(key, value, explode) {
        if (!parameterHasValue(value)) {
            return { pairs: [{ value: `;${key}` }] };
        }
        if (Array.isArray(value)) {
            return {
                pairs: [{ value: explode ? value.map((val) => `;${key}=${val}`).join('') : `;${key}=${value.join(',')}` }]
            };
        }
        if (typeof value === 'object') {
            return {
                pairs: [
                    {
                        value: explode
                            ? Object.entries(value)
                                .map(([subKey, subValue]) => `;${subKey}=${subValue}`)
                                .join('')
                            : `;${key}=${Object.entries(value)
                                .map(([subKey, subValue]) => `${subKey},${subValue}`)
                                .join(',')}`
                    }
                ]
            };
        }
        return { pairs: [{ value: `;${key}=${String(value)}` }] };
    },
    form(key, value, explode) {
        if (!parameterHasValue(value)) {
            return { pairs: [] };
        }
        if (Array.isArray(value)) {
            return {
                pairs: explode ? value.map((val) => ({ key, value: String(val) })) : [{ key, value: value.join(',') }],
                pairSeparator: '&',
                keyValueSeparator: '='
            };
        }
        if (typeof value === 'object') {
            return {
                pairs: explode
                    ? Object.entries(value).map(([subKey, subValue]) => ({ key: subKey, value: String(subValue) }))
                    : [
                        {
                            key,
                            value: Object.entries(value)
                                .map(([subKey, subValue]) => `${subKey},${subValue}`)
                                .join(',')
                        }
                    ],
                pairSeparator: '&',
                keyValueSeparator: '='
            };
        }
        return { pairs: [{ key, value: String(value) }] };
    },
    spaceDelimited(key, value) {
        if (!parameterHasValue(value)) {
            return { pairs: [] };
        }
        if (Array.isArray(value)) {
            return {
                pairs: [{ key, value: value.join(' ') }]
            };
        }
        if (typeof value === 'object') {
            return {
                pairs: [
                    {
                        key,
                        value: Object.entries(value)
                            .map(([subKey, subValue]) => `${subKey} ${subValue}`)
                            .join(' ')
                    }
                ]
            };
        }
        return { pairs: [{ key, value: String(value) }] };
    },
    pipeDelimited(key, value) {
        if (!parameterHasValue(value)) {
            return { pairs: [] };
        }
        if (Array.isArray(value)) {
            return {
                pairs: [{ key, value: value.join('|') }]
            };
        }
        if (typeof value === 'object') {
            return {
                pairs: [
                    {
                        key,
                        value: Object.entries(value)
                            .map(([subKey, subValue]) => `${subKey}|${subValue}`)
                            .join('|')
                    }
                ]
            };
        }
        return { pairs: [{ key, value: String(value) }] };
    },
    deepObject(key, value) {
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            return {
                pairs: Object.entries(value).flatMap(([subKey, subValue]) => formatParameter.deepObject(`${key}[${subKey}]`, subValue, true).pairs),
                pairSeparator: '&',
                keyValueSeparator: '='
            };
        }
        return {
            pairs: [{ key, value: String(value) }]
        };
    }
};
const deprecationWarningShown = {};
const defaultRedirectHandler = async ({ url, response }) => {
    const redirectUrl = new URL(response.headers['location'], url);
    let responseUrl;
    try {
        responseUrl = new URL(response.url);
    }
    catch (e) {
        responseUrl = url;
    }
    if (responseUrl.host !== redirectUrl.host) {
        return { type: 'externalRedirect' };
    }
    else {
        return { type: 'redirect' };
    }
};
async function defaultFetch(url, request) {
    const { ...requestProps } = request;
    const requestInit = requestProps;
    const response = await fetch(url, requestInit);
    const body = isJsonMediaType(response.headers.get('content-type') ?? '')
        ? { type: 'json', data: await response.json() }
        : { type: 'blob', data: await response.blob() };
    const headers = {};
    response.headers.forEach((value, key) => {
        headers[key] = value;
    });
    if (response.headers.has('set-cookie') && 'getSetCookie' in response.headers) {
        headers['set-cookie'] = response.headers.getSetCookie();
    }
    return {
        status: response.status,
        statusText: response.statusText,
        body,
        url: response.url,
        headers,
        ok: response.ok,
        customRequestProps: request.customRequestProps
    };
}
export class CommonHttpClient {
    options;
    constructor(options) {
        this.options = options;
    }
    setOptions(options) {
        this.options = options;
    }
    getOptions() {
        return this.options;
    }
    logDeprecationWarningIfNecessary(params) {
        const methodAndPath = `${params.method} ${params.path}`;
        const operationName = this.options.deprecatedOperations?.[methodAndPath];
        if (!operationName) {
            return;
        }
        if (!deprecationWarningShown[methodAndPath]) {
            deprecationWarningShown[methodAndPath] = true;
            if (this.options.logDeprecationWarning) {
                this.options.logDeprecationWarning({ method: params.method, path: params.path, operationName });
            }
            else {
                console.warn(`Deprecated API call ${this.options.apiClientClassName}.${operationName}: ${methodAndPath}`);
            }
        }
    }
    getSearchParams(params, parameters) {
        const result = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            const { style = 'form', explode = style === 'form' } = parameters[key] ?? {};
            const { pairs } = formatParameter[style](key, value, explode);
            for (const { key, value } of pairs) {
                if (key !== undefined) {
                    result.append(key, value);
                }
            }
        }
        return result;
    }
    buildUrlPath(request, parameters) {
        const pathParams = request.pathParams;
        if (pathParams) {
            return request.path.replace(/\{(.*?)}/g, (original, paramName) => {
                if (Object.prototype.hasOwnProperty.call(pathParams, paramName)) {
                    const { style = 'simple', explode = false } = parameters[paramName] ?? {};
                    return encodeURI(parameterFormattedParameterToString(formatParameter[style](paramName, pathParams[paramName], explode)));
                }
                return original;
            });
        }
        return request.path;
    }
    buildUrl(request) {
        const url = new URL(this.buildUrlPath(request, request.parameters?.path ?? {}).replace(/^\//, ''), this.options.baseUrl.replace(/\/?$/, '/'));
        if (request.query) {
            for (const [key, value] of this.getSearchParams(request.query, request.parameters?.query ?? {})) {
                url.searchParams.append(key, value);
            }
        }
        return url;
    }
    async handleRedirect(error) {
        if (this.options.followRedirects === false) {
            throw error;
        }
        const { request, response, url } = error;
        if (!request || !response) {
            throw error;
        }
        if (response.status < 300 || response.status >= 400 || !response.headers['location']) {
            throw error;
        }
        const redirectHandler = typeof this.options.followRedirects === 'function' ? this.options.followRedirects : defaultRedirectHandler;
        const action = await redirectHandler({ url, request, response });
        if (!action || !('type' in action)) {
            error.message = `Invalid redirect handler result for ${error.message}.`;
            throw error;
        }
        const redirectPreservingMethod = response.status === 307 || response.status === 308;
        const newUrl = new URL(response.headers['location'], url);
        if (action.type === 'error') {
            error.message = `Redirect to ${newUrl.toString()} not allowed by redirect handler. ${error.message}`;
            throw action.error ?? error;
        }
        else if (action.type === 'response') {
            return action.response;
        }
        else if (action.type === 'redirect') {
            const fetchRequest = action.request ??
                (await this.generateFetchRequest({
                    path: newUrl.pathname,
                    method: redirectPreservingMethod ? request.method : 'GET'
                }))[0];
            return this.performFetchRequest(newUrl, fetchRequest, this.options.fetch ?? defaultFetch);
        }
        else if (action.type === 'externalRedirect') {
            const fetchRequest = action.request ?? {
                method: redirectPreservingMethod ? request.method : 'GET',
                headers: {},
                cache: request.cache,
                credentials: request.credentials,
                redirect: 'error'
            };
            return this.performFetchRequest(newUrl, fetchRequest, this.options.externalFetch ?? defaultFetch);
        }
        else {
            error.message = `Invalid redirect handler result for ${error.message}.`;
            throw error;
        }
    }
    async request(request) {
        try {
            return await this.performRequest(request);
        }
        catch (error) {
            if (this.options.processError) {
                throw this.options.processError(error instanceof Error ? error : new Error(String(error)));
            }
            throw error;
        }
    }
    async generateFetchRequest(request) {
        try {
            request = await this.preprocessRequest(request);
        }
        catch (e) {
            let url;
            try {
                url = this.buildUrl(request);
            }
            catch (e) {
                throw new this.options.errorClass(new URL(request.path, this.options.baseUrl), undefined, undefined, this.options, `Error building request URL: ${getErrorMessage(e)}`);
            }
            throw new this.options.errorClass(url, undefined, undefined, this.options, `preprocessRequest error: ${getErrorMessage(e)}`);
        }
        const { body, path: _path, pathParams: _pathParams, query: _query, headers: requestHeaders, cache, credentials, ...otherRequestProps } = request;
        const headers = this.cleanupHeaders(requestHeaders);
        return [
            {
                ...otherRequestProps,
                headers,
                cache: cache ?? 'default',
                credentials: credentials ?? 'same-origin',
                redirect: 'error',
                body: this.getRequestBody(request)
            },
            request
        ];
    }
    async performFetchRequest(url, fetchRequest, fetchMethod) {
        let attemptNumber = 1;
        for (;;) {
            try {
                let fetchResponse;
                try {
                    fetchResponse = await fetchMethod(url, fetchRequest);
                }
                catch (e) {
                    throw new this.options.errorClass(url, fetchRequest, undefined, this.options, getErrorMessage(e));
                }
                if (this.options.preprocessFetchResponse) {
                    try {
                        fetchResponse = await this.options.preprocessFetchResponse(fetchResponse, fetchRequest);
                    }
                    catch (e) {
                        throw new this.options.errorClass(url, fetchRequest, fetchResponse, this.options, `preprocessFetchResponse error: ${getErrorMessage(e)}`);
                    }
                }
                if (!fetchResponse.ok) {
                    return this.handleRedirect(new this.options.errorClass(url, fetchRequest, fetchResponse, this.options, this.options.formatHttpErrorMessage
                        ? this.options.formatHttpErrorMessage(fetchResponse, fetchRequest)
                        : `HTTP Error ${fetchRequest.method} ${url.toString()} ${fetchResponse.status} (${fetchResponse.statusText})`));
                }
                return fetchResponse;
            }
            catch (error) {
                if (!(await this.options.shouldRetryOnError?.(error, attemptNumber))) {
                    throw error;
                }
                attemptNumber++;
            }
        }
    }
    async performRequest(request) {
        this.logDeprecationWarningIfNecessary(request);
        const [fetchRequest, preprocessedRequest] = await this.generateFetchRequest(request);
        let url;
        try {
            url = this.buildUrl(preprocessedRequest);
        }
        catch (e) {
            throw new this.options.errorClass(new URL(request.path, this.options.baseUrl), undefined, undefined, this.options, `Error building request URL: ${getErrorMessage(e)}`);
        }
        return this.performFetchRequest(url, fetchRequest, this.options.fetch ?? defaultFetch);
    }
    responseHandler(distribution) {
        return async (response) => {
            const body = response.body;
            const contentType = response.headers['content-type'];
            const mediaType = contentType ? contentType.replace(/;.*$/, '') : undefined;
            const mediaTypes = distribution[response.status] ?? {};
            let destType;
            if (mediaType) {
                destType = mediaTypes[mediaType];
                if (!destType) {
                    destType = mediaTypes[mediaType.replace(/\/.*$/, '/*')];
                }
                if (!destType) {
                    destType = mediaTypes[mediaType.replace(/^.*\//, '*/')];
                }
                if (!destType) {
                    destType = mediaTypes['*/*'];
                }
            }
            else {
                destType = mediaTypes['*/*'];
            }
            if (!destType) {
                let binaryBody;
                try {
                    binaryBody = await convertResponseBody(body, this.options.binaryResponseType);
                }
                catch (e) {
                    throw new this.options.errorClass(new URL(response.url), undefined, response, this.options, `Error converting response body: ${getErrorMessage(e)}`);
                }
                return {
                    mediaType,
                    status: response.status,
                    body: binaryBody,
                    response
                };
            }
            try {
                const convertedBody = await convertResponseBody(body, destType);
                return {
                    mediaType,
                    status: response.status,
                    body: convertedBody.data,
                    response
                };
            }
            catch (e) {
                throw new this.options.errorClass(new URL(response.url), undefined, response, this.options, `Error converting response body: ${getErrorMessage(e)}`);
            }
        };
    }
    validation(validator) {
        const handleValidationError = this.options.handleValidationError;
        if (!handleValidationError) {
            return validator;
        }
        return (data) => {
            try {
                return validator(data);
            }
            catch (error) {
                handleValidationError(error instanceof Error ? error : new Error(String(error)));
                return data;
            }
        };
    }
    cleanupHeaders(headers) {
        if (headers === undefined) {
            return {};
        }
        return Object.fromEntries(Object.entries(headers ?? {})
            .filter((header) => header[1] !== undefined && header[1] !== null)
            .map(([key, value]) => [key.toLowerCase(), value]));
    }
    getRequestBody(request) {
        if (request.body === undefined) {
            return undefined;
        }
        for (const [key, value] of Object.entries(request.headers ?? {})) {
            if (key.toLowerCase() === 'content-type' && value && isJsonMediaType(value)) {
                return JSON.stringify(request.body);
            }
        }
        return request.body;
    }
    async preprocessRequest(request) {
        const requestWithHeaders = {
            ...request,
            headers: {
                ...this.options.headers,
                ...this.cleanupHeaders(request.headers)
            }
        };
        return this.options.preprocessRequest ? this.options.preprocessRequest(requestWithHeaders) : requestWithHeaders;
    }
}

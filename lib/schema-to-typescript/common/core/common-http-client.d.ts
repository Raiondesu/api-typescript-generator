export interface CommonHttpClientOptions {
    baseUrl: string;
    errorClass: {
        new (url: URL, request: CommonHttpClientFetchRequest | undefined, response: CommonHttpClientFetchResponse | undefined, options: CommonHttpClientOptions | undefined, message: string): Error;
    };
    apiClientClassName: string;
    headers?: CommonHttpClientRequestHeaders;
    preprocessRequest?: (request: CommonHttpClientRequest) => Promise<CommonHttpClientRequest>;
    preprocessFetchResponse?: (response: CommonHttpClientFetchResponse, request: CommonHttpClientFetchRequest) => Promise<CommonHttpClientFetchResponse>;
    fetch?: (url: URL, request: CommonHttpClientFetchRequest) => Promise<CommonHttpClientFetchResponse>;
    binaryResponseType: 'blob' | 'readableStream';
    formatHttpErrorMessage?: (response: CommonHttpClientFetchResponse, request: CommonHttpClientFetchRequest) => string;
    handleValidationError?: (error: Error) => void;
    deprecatedOperations?: {
        [methodAndPath: string]: string;
    };
    logDeprecationWarning?(params: {
        operationName: string;
        path: string;
        method: CommonHttpClientFetchRequest['method'];
    }): void;
    shouldRetryOnError?: (error: Error, attemptNumber: number) => boolean | Promise<boolean>;
    processError?: (error: Error) => Error;
    externalFetch?: (url: URL, request: CommonHttpClientFetchRequest) => Promise<CommonHttpClientFetchResponse>;
    followRedirects?: boolean | ((params: {
        url: URL;
        request: CommonHttpClientFetchRequest;
        response: CommonHttpClientFetchResponse;
    }) => Promise<{
        type: 'error';
        error?: Error;
    } | {
        type: 'response';
        response: CommonHttpClientFetchResponse;
    } | {
        type: 'redirect';
        request?: CommonHttpClientFetchRequest;
    } | {
        type: 'externalRedirect';
        request?: CommonHttpClientFetchRequest;
    }>);
}
export interface CommonHttpClientFetchRequestHeaders {
    [headerName: string]: string;
}
export interface CommonHttpClientRequestHeaders {
    [headerName: string]: string | undefined | null;
}
export interface CommonHttpClientFetchRequest {
    method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'PATCH';
    headers: CommonHttpClientFetchRequestHeaders;
    body?: BodyInit;
    cache: 'default' | 'force-cache' | 'no-cache' | 'no-store' | 'only-if-cached' | 'reload';
    credentials: 'include' | 'omit' | 'same-origin';
    customRequestProps?: Record<string, unknown>;
    redirect: 'error' | 'follow' | 'manual';
}
export type CommonHttpClientRequestParameterSerializeStyle = 'simple' | 'label' | 'matrix' | 'form' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';
export interface CommonHttpClientRequestParameterSerializeInfo {
    style?: CommonHttpClientRequestParameterSerializeStyle;
    explode?: boolean;
}
export type CommonHttpClientRequestParameterLocation = 'path' | 'query' | 'header' | 'cookie';
export type CommonHttpClientRequestParameters = {
    [K in CommonHttpClientRequestParameterLocation]?: Record<string, CommonHttpClientRequestParameterSerializeInfo>;
};
export type CommonHttpClientRequest = Omit<CommonHttpClientFetchRequest, 'body' | 'headers' | 'cache' | 'credentials' | 'redirect'> & {
    path: string;
    pathParams?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: unknown;
    headers?: CommonHttpClientRequestHeaders;
    parameters?: CommonHttpClientRequestParameters;
} & Partial<Pick<CommonHttpClientFetchRequest, 'cache' | 'credentials'>>;
export interface CommonHttpClientFetchResponse {
    status: number;
    statusText: string;
    body: CommonHttpClientFetchResponseBody;
    ok: boolean;
    url: string;
    headers: CommonHttpClientResponseHeaders;
    customRequestProps?: Record<string, unknown>;
}
export type CommonHttpClientResponseHeaders = Record<string, string> & {
    'set-cookie'?: string[];
};
export type CommonHttpClientFetchResponseBody = {
    type: 'json';
    data: unknown;
} | {
    type: 'blob';
    data: Blob;
} | {
    type: 'readableStream';
    data: ReadableStream<Uint8Array>;
};
export interface CommonHttpClientResponse<T> {
    status: number;
    mediaType?: string;
    body: T;
    response: CommonHttpClientFetchResponse;
}
export declare class CommonHttpClientError extends Error {
    readonly url: URL;
    readonly request: CommonHttpClientFetchRequest | undefined;
    readonly response: CommonHttpClientFetchResponse | undefined;
    readonly options: CommonHttpClientOptions | undefined;
    constructor(url: URL, request: CommonHttpClientFetchRequest | undefined, response: CommonHttpClientFetchResponse | undefined, options: CommonHttpClientOptions | undefined, message: string);
}
type ResponseByMediaType<T extends CommonHttpClientResponse<unknown>, K extends string> = T extends unknown ? ((a: T) => void) extends (a: {
    mediaType: K;
    status: infer _Status;
    body: infer _Body;
    response: CommonHttpClientFetchResponse;
}) => void ? T : never : never;
export declare function checkReponseMediaType<T extends CommonHttpClientResponse<unknown>, K extends string>(response: T, mediaType: K): response is ResponseByMediaType<T, K> extends never ? ResponseByMediaType<T, '*/*'> : ResponseByMediaType<T, K>;
export declare function isJsonMediaType(mediaType: string): boolean;
type AsCreatedResponseFunction<KCreated extends string, KOther extends string> = <T extends CommonHttpClientResponse<unknown>>(response: T) => ({
    [K in KCreated]: Extract<T, {
        status: 201;
    }>['body'];
} & {
    created: true;
}) | ({
    [K in KOther]: Extract<T, {
        status: 200;
    }>['body'];
} & {
    created: false;
});
export declare function asCreatedResponse<KCreated extends string>(keyCreated: KCreated): AsCreatedResponseFunction<KCreated, KCreated>;
export declare function asCreatedResponse<KCreated extends string, KOther extends string>(keyCreated: KCreated, keyOther: KOther): AsCreatedResponseFunction<KCreated, KOther>;
export declare const getBody: <T>({ body }: CommonHttpClientResponse<T>) => T;
export declare const castResponse: <T extends Omit<CommonHttpClientResponse<unknown>, "response">>() => (response: CommonHttpClientResponse<unknown>) => WithResponse<T>;
export declare const discardResult: () => void;
export type WithResponse<T> = T & {
    response: CommonHttpClientFetchResponse;
};
export declare function createClientWithServices<TOptions, TClient extends {
    getClient(): CommonHttpClient;
}, TServices extends Record<string, {
    new (client: CommonHttpClient): unknown;
}>>(this: {
    new (options?: TOptions): TClient;
}, services: TServices, options?: TOptions): TClient & {
    [K in keyof TServices as K extends string ? Uncapitalize<K extends `${infer TName}Service` ? TName : K> : K]: InstanceType<TServices[K]>;
};
export declare class CommonHttpClient {
    protected options: CommonHttpClientOptions;
    constructor(options: CommonHttpClientOptions);
    setOptions(options: CommonHttpClientOptions): void;
    getOptions(): CommonHttpClientOptions;
    protected logDeprecationWarningIfNecessary(params: {
        path: string;
        method: CommonHttpClientFetchRequest['method'];
    }): void;
    protected getSearchParams(params: Record<string, unknown>, parameters: Record<string, CommonHttpClientRequestParameterSerializeInfo>): URLSearchParams;
    protected buildUrlPath(request: CommonHttpClientRequest, parameters: Record<string, CommonHttpClientRequestParameterSerializeInfo>): string;
    protected buildUrl(request: CommonHttpClientRequest): URL;
    protected handleRedirect(error: CommonHttpClientError): Promise<CommonHttpClientFetchResponse>;
    request(request: CommonHttpClientRequest): Promise<CommonHttpClientFetchResponse>;
    protected generateFetchRequest(request: CommonHttpClientRequest): Promise<[CommonHttpClientFetchRequest, CommonHttpClientRequest]>;
    protected performFetchRequest(url: URL, fetchRequest: CommonHttpClientFetchRequest, fetchMethod: (url: URL, request: CommonHttpClientFetchRequest) => Promise<CommonHttpClientFetchResponse>): Promise<CommonHttpClientFetchResponse>;
    protected performRequest(request: CommonHttpClientRequest): Promise<CommonHttpClientFetchResponse>;
    responseHandler(distribution: {
        [statusCode: string]: {
            [mediaType: string]: CommonHttpClientFetchResponseBody['type'];
        };
    }): (response: CommonHttpClientFetchResponse) => Promise<CommonHttpClientResponse<unknown>>;
    validation<D>(validator: (data: D) => D): (data: D) => D;
    private cleanupHeaders;
    protected getRequestBody(request: CommonHttpClientRequest): BodyInit | undefined;
    protected preprocessRequest(request: CommonHttpClientRequest): Promise<CommonHttpClientRequest>;
}
export {};

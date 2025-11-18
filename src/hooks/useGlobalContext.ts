
export interface WritableGlobalContext extends ReadableGlobalContext {
    registerService(key: string, handler: object): void;

    mockService(key: string, handler: object): void;
}

export interface ReadableGlobalContext {
    getService<T extends object>(key: string): T;
}

const services: Map<string, object> = new Map<string, object>();

function registerService(key: string, handler: object): void {
    if (services.has(key)) {
        throw `A service with the name '${key}' is already register`;
    }

    services.set(key, handler);
}

function mockService(key: string, handler: object): void {
    if (!services.has(key)) {
        throw `A service with the name '${key}' is not register`;
    }

    services.set(key, handler);
}

function getService<T extends object>(key: string): T {
    const handler: T | undefined = services.get(key) as T | undefined;

    if (!handler) {
        throw `A service with the name '${key}' is not register`;
    }

    return handler;
}

export function useGlobalContext(readonly: true): ReadableGlobalContext;
export function useGlobalContext(readonly?: false): WritableGlobalContext;
export function useGlobalContext(readonly?: boolean): ReadableGlobalContext | WritableGlobalContext {
    if (readonly) {
        return {
            getService
        };
    }

    return {
        getService,

        registerService,

        mockService,
    };
}
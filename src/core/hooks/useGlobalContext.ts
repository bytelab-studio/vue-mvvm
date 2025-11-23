import {
    InvalidServiceInstanceError,
    ServiceAlreadyRegisteredError,
    ServiceNotRegisteredError
} from "@/errors";

export type FactoryFunction<T> = (ctx: ReadableGlobalContext) => T;

/**
 * Provides a interface for accessing the global context
 */
export interface WritableGlobalContext extends ReadableGlobalContext {
    /**
     * Registers a service with a specified key and factory function.
     *
     * @param key     - The class or constructor function that serves as the unique identifier for the service.
     * @param factory - A factory function that creates an instance of the service associated with the provided key.
     */
    registerService<T extends new (...args: any[]) => any>(key: T, factory: FactoryFunction<InstanceType<T>>): void;

    /**
     * Mocks a service by providing a custom implementation for the specified key.
     * This allows overriding the default behavior of a service with a custom handler.
     *
     * @param key     - The constructor of the service class to be mocked.
     * @param handler - A factory function that provides the mocked behavior for the service.
     */
    mockService(key: new (...args: any[]) => any, handler: FactoryFunction<unknown>): void;
}

/**
 * Provides a read-only interface for accessing the global context
 */
export interface ReadableGlobalContext {
    /**
     * Retrieves a service instance corresponding to the provided class or constructor function.
     *
     * @param key - The class or constructor function that represents the service to retrieve.
     *
     * @return An instance of the service represented by the provided class or constructor function.
     */
    getService<T extends new (...args: any[]) => any>(key: T): InstanceType<T>;
}

const services: Map<unknown, FactoryFunction<unknown>> = new Map<unknown, FactoryFunction<unknown>>();
const serviceInstances: Map<unknown, unknown> = new Map<unknown, unknown>();

function registerService<T extends new (...args: any[]) => any>(key: T, handler: FactoryFunction<InstanceType<T>>): void {
    if (services.has(key)) {
        throw new ServiceAlreadyRegisteredError(key);
    }

    services.set(key, handler);
}

function mockService(key: new (...args: any[]) => any, handler: FactoryFunction<unknown>): void {
    if (!services.has(key)) {
        throw new ServiceNotRegisteredError(key);
    }

    services.set(key, handler);
}

function getService<T extends new (...args: any[]) => any>(key: T): InstanceType<T> {
    let instance: InstanceType<T> | undefined = serviceInstances.get(key) as InstanceType<T> | undefined;

    if (instance) {
        return instance;
    }

    const factory: FactoryFunction<InstanceType<T>> | undefined = services.get(key) as FactoryFunction<InstanceType<T>> | undefined;
    if (!factory) {
        throw new ServiceNotRegisteredError(key);
    }
    instance = factory(useGlobalContext(true));
    if (!instance) {
        throw new InvalidServiceInstanceError(key);
    }

    serviceInstances.set(key, instance);
    return instance;
}

/**
 * @internal
 */
export function useGlobalContext(readonly: true): ReadableGlobalContext;

/**
 * @internal
 */
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
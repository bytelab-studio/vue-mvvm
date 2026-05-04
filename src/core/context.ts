import {InvalidServiceInstanceError, ServiceAlreadyRegisteredError, ServiceNotRegisteredError} from "@/errors";
import {Component} from "vue";

export type FactoryFunction<T> = (ctx: ReadableGlobalContext) => T;

export type AsyncFactoryFunction<T> = (ctx: ReadableGlobalContext) => Promise<T>;

/**
 * Provides an interface for accessing the global context
 */
export interface WritableGlobalContext extends ReadableGlobalContext {
    /**
     * Registers a provider component
     *
     * @param component - The provider component
     */
    registerProvider(component: Component): void;

    /**
     * Registers a service with a specified key and factory function.
     *
     * @param key     - The class or constructor function that serves as the unique identifier for the service.
     * @param factory - A factory function that creates an instance of the service associated with the provided key.
     */
    registerService<T extends new (...args: any[]) => any>(key: T, factory: FactoryFunction<InstanceType<T>>): void;

    /**
     * Registers a service with a ServiceKey key and factory function.
     *
     * @param key     - The ServiceKey that serves as the unique identifier for the service.
     * @param factory - A factory function that creates an instance of the service associated with the provided key.
     */
    registerService<T>(key: ServiceKey<T>, factory: FactoryFunction<T>): void;

    /**
     * Registers a service with an AsyncServiceKey key and async factory function.
     *
     * @param key     - The AsyncServiceKey that serves as the unique identifier for the service.
     * @param factory - An async factory function that creates an instance of the service associated with the provided key.
     */
    registerService<T>(key: AsyncServiceKey<T>, factory: AsyncFactoryFunction<T>): void;

    /**
     * Mocks a service by providing a custom implementation for the specified key.
     * This allows overriding the default behavior of a service with a custom handler.
     *
     * @param key     - The constructor of the service class to be mocked.
     * @param handler - A factory function that provides the mocked behavior for the service.
     */
    mockService(key: new (...args: any[]) => any, handler: FactoryFunction<unknown>): void;

    /**
     * Mocks a service by providing a custom implementation for the specified key.
     * This allows overriding the default behavior of a service with a custom handler.
     *
     * @param key     - The ServiceKey that serves as the unique identifier for the service.
     * @param factory - A factory function that creates an instance of the service associated with the provided key.
     */
    mockService<T>(key: ServiceKey<T>, factory: FactoryFunction<T>): void;

    /**
     * Mocks a service by providing a custom implementation for the specified key.
     * This allows overriding the default behavior of a service with a custom handler.
     *
     * @param key     - The AsyncServiceKey that serves as the unique identifier for the service.
     * @param factory - An async factory function that creates an instance of the service associated with the provided key.
     */
    mockService<T>(key: AsyncServiceKey<T>, factory: AsyncFactoryFunction<T>): void;

    /**
     * Creates a ReadableGlobalContext from this WritableGlobalContext reference
     *
     * @return A ReadableGlobalContext
     */
    toReadableGlobalContext(): ReadableGlobalContext;
}

/**
 * Provides a read-only interface for accessing the global context
 */
export interface ReadableGlobalContext {
    /**
     * Return all registered providers
     */
    getProviders(): Component[];

    /**
     * Retrieves a service instance corresponding to the provided class or constructor function.
     *
     * @param key - The class or constructor function that represents the service to retrieve.
     *
     * @return An instance of the service represented by the provided class or constructor function.
     */
    getService<T extends new (...args: any[]) => any>(key: T): InstanceType<T>;

    /**
     * Retrieves a service instance based on the passed ServiceKey
     *
     * @param key - The ServiceKey connected with the service
     */
    getService<T>(key: ServiceKey<T>): T;

    /**
     * Retrieves a service instance based on the passed AsyncServiceKey.
     * The services are resolved async.
     *
     * @param key - The AsyncServiceKey connected with the service
     */
    getService<T>(key: AsyncServiceKey<T>): Promise<T>;
}

const providers: Set<Component> = new Set<Component>();
const services: Map<unknown, FactoryFunction<unknown> | AsyncFactoryFunction<unknown>> = new Map<unknown, FactoryFunction<unknown> | AsyncFactoryFunction<unknown>>();
const serviceInstances: Map<unknown, unknown> = new Map<unknown, unknown>();

function registerProvider(provider: Component): void {
    providers.add(provider);
}

function registerService<T>(key: ServiceKey<T>, handler: FactoryFunction<T>): void;

function registerService<T>(key: AsyncServiceKey<T>, handler: AsyncFactoryFunction<T>): void

function registerService<T extends new (...args: any[]) => any>(key: T, handler: FactoryFunction<InstanceType<T>>): void;

function registerService<T>(key: T | ServiceKey<T> | AsyncServiceKey<T>, handler: FactoryFunction<unknown> | AsyncFactoryFunction<unknown>): void {
    const mapKey: string | T = key instanceof ServiceKey || key instanceof AsyncServiceKey
        ? key.name
        : key;

    if (services.has(mapKey)) {
        throw new ServiceAlreadyRegisteredError(key);
    }

    services.set(mapKey, handler);
}

function mockService<T>(key: ServiceKey<T>, handler: FactoryFunction<T>): void;

function mockService<T>(key: AsyncServiceKey<T>, handler: AsyncFactoryFunction<T>): void

function mockService<T extends new (...args: any[]) => any>(key: T, handler: FactoryFunction<InstanceType<T>>): void;

function mockService<T>(key: T | ServiceKey<T> | AsyncServiceKey<T>, handler: FactoryFunction<unknown> | AsyncFactoryFunction<unknown>): void {
    const mapKey: string | T = key instanceof ServiceKey || key instanceof AsyncServiceKey
        ? key.name
        : key;

    if (!services.has(mapKey)) {
        throw new ServiceNotRegisteredError(key);
    }

    services.set(mapKey, handler);
}

function getProviders(): Component[] {
    return Array.from(providers);
}

function getService<T extends new (...args: any[]) => any>(key: T): InstanceType<T>;

function getService<T>(key: ServiceKey<T>): T;

function getService<T>(key: AsyncServiceKey<T>): Promise<T>;

function getService<T>(key: T | ServiceKey<T> | AsyncServiceKey<T>): unknown | Promise<unknown> {
    const mapKey: string | T = key instanceof ServiceKey || key instanceof AsyncServiceKey
        ? key.name
        : key;

    let instance: unknown | undefined = serviceInstances.get(mapKey);

    if (instance) {
        return instance;
    }

    const factory: FactoryFunction<unknown> | AsyncFactoryFunction<unknown> | undefined = services.get(mapKey);

    if (!factory) {
        throw new ServiceNotRegisteredError(key);
    }

    if (key instanceof AsyncServiceKey) {
        return new Promise<unknown>(async (resolve, reject) => {
            const instance: unknown = await factory(useGlobalContext(true));
            if (!instance) {
                reject(new InvalidServiceInstanceError(key));
                return;
            }

            serviceInstances.set(mapKey, instance);
            resolve(instance);
        });
    }

    instance = factory(useGlobalContext(true));
    if (!instance) {
        throw new InvalidServiceInstanceError(key);
    }

    serviceInstances.set(mapKey, instance);
    return instance;
}

/**
 * Can be used to register a service that lives not in a class.
 */
export class ServiceKey<T> {
    public readonly name: string;

    public constructor(name: string) {
        this.name = name;
    }

    public [Symbol.toPrimitive](): string {
        return this.name;
    }
}

/**
 * Can be used to register a service that lives not in a class.
 * Additionally, the factory function is defined as async.
 */
export class AsyncServiceKey<T> {
    public readonly name: string;

    public constructor(name: string) {
        this.name = name;
    }

    public [Symbol.toPrimitive](): string {
        return this.name;
    }
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
            getProviders,

            getService
        };
    }

    return {
        getProviders,

        getService,

        registerService,

        mockService,

        registerProvider,

        toReadableGlobalContext(): ReadableGlobalContext {
            return {
                getService: this.getService,
                getProviders: this.getProviders
            }
        }
    };
}

/**
 * Gets a readable access point to the global DI container
 *
 * @return A readable global context container
 */
export function getGlobalContext(): ReadableGlobalContext {
    return useGlobalContext();
}
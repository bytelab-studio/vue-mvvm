import {Component} from "vue";
import {InvalidServiceInstanceError, ServiceAlreadyRegisteredError, ServiceNotRegisteredError} from "@/errors";

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

/**
 * A container that manages dependency injection, including service registration,
 * resolution, and provider components.
 */
export class DIContainer implements WritableGlobalContext {
    private readonly providers: Set<Component> = new Set<Component>();
    private readonly services: Map<unknown, FactoryFunction<unknown> | AsyncFactoryFunction<unknown>> = new Map<unknown, FactoryFunction<unknown> | AsyncFactoryFunction<unknown>>();
    private readonly serviceInstances: Map<unknown, unknown> = new Map<unknown, unknown>();

    /**
     * Registers a provider component.
     *
     * @param provider - The Vue component to register as a provider.
     */
    public registerProvider(provider: Component): void {
        this.providers.add(provider);
    }

    /**
     * Registers a service with a specified key and factory function.
     *
     * @param key     - The key used to identify the service.
     * @param handler - A factory function that creates an instance of the service.
     */
    public registerService<T>(key: ServiceKey<T>, handler: FactoryFunction<T>): void;
    /**
     * Registers an asynchronous service with a specified key and factory function.
     *
     * @param key     - The key used to identify the service.
     * @param handler - An asynchronous factory function that creates an instance of the service.
     */
    public registerService<T>(key: AsyncServiceKey<T>, handler: AsyncFactoryFunction<T>): void
    /**
     * Registers a service with a constructor key and factory function.
     *
     * @param key     - The constructor function used as the key.
     * @param handler - A factory function that creates an instance of the service.
     */
    public registerService<T extends new (...args: any[]) => any>(key: T, handler: FactoryFunction<InstanceType<T>>): void;
    public registerService<T>(key: T | ServiceKey<T> | AsyncServiceKey<T>, handler: FactoryFunction<unknown> | AsyncFactoryFunction<unknown>): void {
        const mapKey: string | T = key instanceof ServiceKey || key instanceof AsyncServiceKey
            ? key.name
            : key;

        if (this.services.has(mapKey)) {
            throw new ServiceAlreadyRegisteredError(key);
        }

        this.services.set(mapKey, handler);
    }

    /**
     * Mocks a service by providing a custom implementation for the specified key.
     *
     * @param key     - The key used to identify the service to be mocked.
     * @param handler - A factory function that provides the mocked behavior.
     */
    public mockService<T>(key: ServiceKey<T>, handler: FactoryFunction<T>): void;
    /**
     * Mocks an asynchronous service by providing a custom implementation for the specified key.
     *
     * @param key     - The key used to identify the service to be mocked.
     * @param handler - An asynchronous factory function that provides the mocked behavior.
     */
    public mockService<T>(key: AsyncServiceKey<T>, handler: AsyncFactoryFunction<T>): void
    /**
     * Mocks a service with a constructor key.
     *
     * @param key     - The constructor function used as the key.
     * @param handler - A factory function that provides the mocked behavior.
     */
    public mockService<T extends new (...args: any[]) => any>(key: T, handler: FactoryFunction<InstanceType<T>>): void;
    public mockService<T>(key: T | ServiceKey<T> | AsyncServiceKey<T>, handler: FactoryFunction<unknown> | AsyncFactoryFunction<unknown>): void {
        const mapKey: string | T = key instanceof ServiceKey || key instanceof AsyncServiceKey
            ? key.name
            : key;

        if (!this.services.has(mapKey)) {
            throw new ServiceNotRegisteredError(key);
        }

        this.services.set(mapKey, handler);
    }

    /**
     * Retrieves all registered provider components.
     *
     * @returns An array of registered provider components.
     */
    public getProviders(): Component[] {
        return Array.from(this.providers);
    }

    /**
     * Retrieves a service instance by its constructor.
     *
     * @param key - The constructor function of the service.
     * @returns The instance of the requested service.
     */
    public getService<T extends new (...args: any[]) => any>(key: T): InstanceType<T>;
    /**
     * Retrieves a service instance by its ServiceKey.
     *
     * @param key - The ServiceKey of the service.
     * @returns The instance of the requested service.
     */
    public getService<T>(key: ServiceKey<T>): T;
    /**
     * Retrieves a service instance asynchronously by its AsyncServiceKey.
     *
     * @param key - The AsyncServiceKey of the service.
     * @returns A promise that resolves with the instance of the requested service.
     */
    public getService<T>(key: AsyncServiceKey<T>): Promise<T>;
    public getService<T>(key: T | ServiceKey<T> | AsyncServiceKey<T>): unknown | Promise<unknown> {
        const mapKey: string | T = key instanceof ServiceKey || key instanceof AsyncServiceKey
            ? key.name
            : key;

        let instance: unknown | undefined = this.serviceInstances.get(mapKey);

        if (instance) {
            return instance;
        }

        const factory: FactoryFunction<unknown> | AsyncFactoryFunction<unknown> | undefined = this.services.get(mapKey);

        if (!factory) {
            throw new ServiceNotRegisteredError(key);
        }

        if (key instanceof AsyncServiceKey) {
            return new Promise<unknown>(async (resolve, reject) => {
                const instance: unknown = await factory(this.toReadableGlobalContext());
                if (!instance) {
                    reject(new InvalidServiceInstanceError(key));
                    return;
                }

                this.serviceInstances.set(mapKey, instance);
                resolve(instance);
            });
        }

        instance = factory(this.toReadableGlobalContext());
        if (!instance) {
            throw new InvalidServiceInstanceError(key);
        }

        this.serviceInstances.set(mapKey, instance);
        return instance;
    }

    /**
     * Creates a ReadableGlobalContext from this DIContainer instance.
     *
     * @returns A read-only interface to the container.
     */
    public toReadableGlobalContext(): ReadableGlobalContext {
        return {
            getService: this.getService.bind(this),
            getProviders: this.getProviders.bind(this)
        };
    }
}

const globalContainer = new DIContainer();

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
        return globalContainer.toReadableGlobalContext();
    }

    return globalContainer;
}

/**
 * Gets a readable access point to the global DI container
 *
 * @return A readable global context container
 */
export function getGlobalContext(): ReadableGlobalContext {
    return useGlobalContext();
}
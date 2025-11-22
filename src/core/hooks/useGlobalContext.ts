import {
    InvalidServiceInstanceError,
    ServiceAlreadyRegisteredError,
    ServiceNotRegisteredError
} from "@/errors";

export type FactoryFunction<T> = (ctx: ReadableGlobalContext) => T;

export interface WritableGlobalContext extends ReadableGlobalContext {
    registerService<T extends new (...args: any[]) => any>(key: T, factory: FactoryFunction<InstanceType<T>>): void;

    mockService(key: new (...args: any[]) => any, handler: FactoryFunction<unknown>): void;
}

export interface ReadableGlobalContext {
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
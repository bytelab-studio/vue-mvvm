import * as vue from "vue";
import {ViewModel} from "@/ViewModel";

export type ReactiveField<T> = T | ReactiveMarker<T>;

export type ReactiveMarker<T> = RefMarker<T> | ComputedMarker<T>;

export interface RefMarker<T> {
    __isReactiveField: true;
    __reactiveType: "ref";
    initial: T;
}

export interface ComputedMarker<T> {
    __isReactiveField: true;
    __reactiveType: "computed";
    getter: vue.ComputedGetter<T>;
    setter?: vue.ComputedSetter<T>;
}

export function ref<T>(initial: T): ReactiveField<T> {
    return {
        __isReactiveField: true,
        __reactiveType: "ref",
        initial: initial
    }
}

export function computed<T>(getter: vue.ComputedGetter<T>): ReactiveField<T>;
export function computed<T>(options: { get: vue.ComputedGetter<T>, set: vue.ComputedSetter<T> }): ReactiveField<T>;
export function computed<T>(arg: vue.ComputedGetter<T> | {
    get: vue.ComputedGetter<T>,
    set: vue.ComputedSetter<T>
}): ReactiveField<T> {
    if (typeof arg == "function") {
        return {
            __isReactiveField: true,
            __reactiveType: "computed",
            getter: arg as vue.ComputedGetter<T>
        } as ComputedMarker<T>;
    }

    return {
        __isReactiveField: true,
        __reactiveType: "computed",
        getter: arg.get,
        setter: arg.set
    } as ComputedMarker<T>;
}

function isReactiveField(value: any): value is ReactiveMarker<any> {
    return typeof value == "object" && value != null && "__isReactiveField" in value && value.__isReactiveField === true;
}

export function applyReactivity<T extends object>(vm: T): T {
    const reactiveMap: Map<any, [ReactiveMarker<any>, vue.Ref | vue.WritableComputedRef<any>]> = new Map<any, [ReactiveMarker<any>, vue.Ref | vue.WritableComputedRef<any>]>();

    return new Proxy(vm, {
        get(target: object, key: string | symbol): any {
            const slot: [ReactiveMarker<any>, vue.Ref | vue.WritableComputedRef<any>] | undefined = reactiveMap.get(key);
            if (slot) {
                switch (slot[0].__reactiveType) {
                    case "ref":
                        return (slot[1] as vue.Ref).value;
                    case "computed":
                        return (slot[1] as vue.ComputedRef).value;
                }

                throw new Error("Not implemented (Fail guard)");
            }

            const value: any = Reflect.get(target, key);
            if (!isReactiveField(value)) {
                return value;
            }

            switch (value.__reactiveType) {
                case "ref":
                    const ref: vue.Ref = vue.ref(value.initial);
                    reactiveMap.set(key, [value, ref]);
                    return ref.value;
                case "computed":
                    const hasSetter: boolean = !!value.setter;
                    const computed: vue.ComputedRef = vue.computed(hasSetter ? {
                        get: value.getter,
                        set: value.setter!
                    } : (value.getter as any));
                    reactiveMap.set(key, [value, computed]);
                    return computed.value;
            }

            throw new Error("Not implemented (Fail guard)");
        },
        set(target: T, key: string | symbol, value: any): boolean {
            const slot: [ReactiveMarker<any>, vue.Ref | vue.WritableComputedRef<any>] | undefined = reactiveMap.get(key);
            if (slot) {
                switch (slot[0].__reactiveType) {
                    case "ref":
                        (slot[1] as vue.Ref).value = value;
                        return true;
                    case "computed":
                        if (!slot[0].setter) {
                            const name: string = typeof key == "string" ? key : String(key);
                            throw new Error(`Cannot assign to computed property '${name}': no setter was defined`);
                        }
                        (slot[1] as vue.WritableComputedRef<any>).value = value;
                        return true;
                }

                throw new Error("Not implemented (Fail guard)");
            }


            const current: any = Reflect.get(target, key);
            if (isReactiveField(current)) {
                switch (current.__reactiveType) {
                    case "ref":
                        const ref: vue.Ref = vue.ref(current.initial);
                        reactiveMap.set(key, [current, ref]);
                        ref.value = value;
                        return true;
                    case "computed":
                        const hasSetterInit: boolean = !!current.setter;
                        if (!hasSetterInit) {
                            const name: string = typeof key == "string" ? key : String(key);
                            throw new Error(`Cannot assign to computed property '${name}': no setter was defined`);
                        }
                        const computed: vue.WritableComputedRef<any> = vue.computed({
                            get: current.getter,
                            set: current.setter!
                        });
                        reactiveMap.set(key, [current, computed]);
                        computed.value = value;
                        return true;
                }
            }

            return Reflect.set(target, key, value);
        }
    }) as T;
}
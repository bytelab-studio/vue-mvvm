export class MVVMError extends Error {
    constructor(message: string) {
        super(message);
        this.name = new.target.name;
    }

    public static hint(text: string): string {
        return `(Hint: ${text})`;
    }

    public static describeKey(key: unknown): string {
        if (typeof key === 'function' && key.name) return key.name;
        try {
            return String(key);
        } catch {
            return 'unknown';
        }
    }
}

export class ServiceAlreadyRegisteredError extends MVVMError {
    constructor(key: unknown) {
        super(
            `Service is already registered for key '${MVVMError.describeKey(key)}'. ` +
            MVVMError.hint(
                "Avoid duplicate registration. If you need to override in tests, use ctx.mockService instead of registerService."
            )
        );
    }
}

export class ServiceNotRegisteredError extends MVVMError {
    constructor(key: unknown) {
        super(
            `No service registered for key '${MVVMError.describeKey(key)}'. ` +
            MVVMError.hint(
                "Register it in useMVVM({ configureServices(ctx) { ctx.registerService(MySvc, () => new MySvc()) } })."
            )
        );
    }
}

export class InvalidServiceInstanceError extends MVVMError {
    constructor(key: unknown) {
        super(
            `Factory for service '${MVVMError.describeKey(key)}' returned an invalid instance. ` +
            MVVMError.hint("Ensure the factory returns a concrete instance of the service.")
        );
    }
}

export class HookUsageError extends MVVMError {
    constructor(hookName: string) {
        super(
            `${hookName} must be called within the setup() of a Vue component. ` +
            MVVMError.hint("Ensure you call the hook from within a component's setup function.")
        );
    }
}

export class MissingComponentMetadataError extends MVVMError {
    constructor(context: string) {
        super(
            `${context} component is missing required metadata. ` +
            MVVMError.hint(
                "Make sure the component is rendered by DialogProvider or created via DialogService, which injects the needed metadata."
            )
        );
    }
}

export class DialogControlMismatchError extends MVVMError {
    constructor(expected: Function) {
        super(
            `Injected dialog control is not compatible with the expected type '${expected.name}'. ` +
            MVVMError.hint(
                "You can pass the same class used to create the dialog OR any of its superclasses (base classes)."
            )
        );
    }
}


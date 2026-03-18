import {
    InfoToastConstructor,
    InfoToastControl, ProgressToastConstructor,
    ProgressToastControl,
    ToastControl,
    ToastControlConstructor
} from "@/ToastControl";
import {MVVMError} from "vue-mvvm";
import {providerRegistry, toastRegistry} from "@/ToastProvider";

let infoControl: InfoToastConstructor | null = null;

/**
 * @internal
 */
export function setInfoControl(control: InfoToastConstructor | null): void {
    infoControl = control;
}

let progressControl: ProgressToastConstructor | null = null;

/**
 * @internal
 */
export function setProgressControl(control: ProgressToastConstructor | null): void {
    progressControl = control;
}

/**
 * Common options for all toast types.
 */
export interface ToastOptions {
    /**
     * The type (category) of the toast.
     */
    type: "info" | "warning" | "error" | (string & {});

    /**
     * The title of the toast.
     */
    title: string;

    /**
     * The description/message of the toast.
     */
    description: string;
}

/**
 * Options for {@link InfoToastControl}.
 */
export interface InfoToastOptions extends ToastOptions {
    /**
     * The duration (in milliseconds) before the toast is automatically destroyed.
     */
    duration?: number;
}

/**
 * Options for {@link ProgressToastControl}.
 */
export interface ProgressToastOptions extends ToastOptions {
    /**
     * Whether the progress is indeterminate.
     */
    indeterminate?: boolean;

    /**
     * The maximum value of the progress bar.
     */
    max?: number;
}

/**
 * Error thrown when an info toast is requested but no component is registered.
 */
export class InfoComponentNotFoundError extends MVVMError {
    constructor() {
        super(
            `No InfoToastControl was found.` +
            MVVMError.hint(
                "Did you forget to set it in you AppShell config?"
            )
        );
    }
}

/**
 * Error thrown when a progress toast is requested but no component is registered.
 */
export class ProgressComponentNotFoundError extends MVVMError {
    constructor() {
        super(
            `No ProgressToastControl was found.` +
            MVVMError.hint(
                "Did you forget to set it in you AppShell config?"
            )
        );
    }
}

/**
 * Service for showing toasts.
 */
export class ToastService {
    /**
     * Shows an informational toast.
     *
     * @param options - The options for the toast.
     *
     * @throws {@link InfoComponentNotFoundError} if no info toast component is registered.
     *
     * @returns A promise that resolves to the {@link InfoToastControl} instance.
     */
    public async showInfo(options: InfoToastOptions): Promise<InfoToastControl> {
        if (!infoControl) {
            throw new InfoComponentNotFoundError();
        }

        return await this.initToast(infoControl, options);
    }

    /**
     * Shows a progress toast.
     *
     * @param options - The options for the toast.
     *
     * @throws {@link ProgressComponentNotFoundError} if no progress toast component is registered.
     *
     * @returns A promise that resolves to the {@link ProgressToastControl} instance.
     */
    public async showProgress(options: ProgressToastOptions): Promise<ProgressToastControl> {
        if (!progressControl) {
            throw new ProgressComponentNotFoundError();
        }

        return await this.initToast(progressControl, options);
    }

    /**
     * Initializes and registers a new toast.
     *
     * @param cls     - The constructor for the toast.
     * @param options - The options for the toast.
     * @param args    - Additional arguments for the constructor.
     *
     * @returns A promise that resolves to the toast instance.
     */
    public async initToast<
        Options extends ToastOptions,
        Instance extends ToastControl<Options>,
        Arguments extends any[]
    >(
        cls: ToastControlConstructor<Options, Instance, Arguments>,
        options: Options,
        ...args: Arguments
    ): Promise<Instance> {
        const instance: Instance = new cls(options, ...args);

        toastRegistry.push(instance);

        for (const provider of providerRegistry) {
            provider();
        }

        return instance
    }
}
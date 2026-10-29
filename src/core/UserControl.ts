import {getCurrentInstance, type ComponentInternalInstance} from "vue";

import {ViewModel, type ViewModelConstructor} from "./ViewModel.js";
import {MVVMError} from "./errors.js";

export type UserControlProps = Record<string, any>;

/**
 * A type definition for a valid UserControl class constructor.
 */
export type UserControlConstructor<
    Props extends UserControlProps = {},
    Instance extends UserControl<Props> = UserControl<Props>, 
    Arguments extends [...unknown[]] = []
> = ViewModelConstructor<Instance, Arguments>;

/**
 * The UserControl class provides a foundation for creating reusable and interactive
 * UI components within an application.
 *
 * It should be used when UI logic gets too
 * heavy to put it in a single ViewModel class, instead some parts of the UI (e.g. forms)
 * are abstracted into their own UserControl logic and communicate with the using
 * ViewModel via the {@link Action} interface
 */
export class UserControl<Props extends UserControlProps = {}> extends ViewModel {
    protected props: Props = this.computed(() => {
        const instance: ComponentInternalInstance | null = getCurrentInstance();
        if (!instance) {
            throw new MVVMError("UserControl is not used bounded to an instance");
        }

        return instance.props as Props;
    });
    
    public constructor() {
        super();
    }
}
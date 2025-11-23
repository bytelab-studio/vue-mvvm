import { ViewModel, ViewModelConstructor } from "./ViewModel";

/**
 * A type definition for a valid UserControl class constructor.
 */
export type UserControlConstructor<Instance extends UserControl = UserControl, Arguments extends [...unknown[]] = []> = ViewModelConstructor<Instance, Arguments>;

/**
 * The UserControl class provides a foundation for creating reusable and interactive
 * UI components within an application.
 *
 * It should be used when UI logic gets too
 * heavy to put it in a single ViewModel class, instead some parts of the UI (e.g. forms)
 * are abstracted into their own UserControl logic and communicate with the using
 * ViewModel via the {@link Action} interface
 */
export class UserControl extends ViewModel {
    public constructor() {
        super();
    }
}
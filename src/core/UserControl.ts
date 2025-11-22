import { ViewModel, ViewModelConstructor } from "./ViewModel";

export type UserControlConstructor<Instance extends UserControl = UserControl, Arguments extends [...unknown[]] = []> = ViewModelConstructor<Instance, Arguments>;

export class UserControl extends ViewModel {
    public constructor() {
        super();
    }
}
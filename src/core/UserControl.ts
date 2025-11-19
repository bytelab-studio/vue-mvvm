import { ViewModel, ViewModelConstructor } from "./ViewModel";

export type UserControlConstructor<T extends UserControl> = ViewModelConstructor<T>;

export class UserControl extends ViewModel {
    public constructor() {
        super();
    }
}
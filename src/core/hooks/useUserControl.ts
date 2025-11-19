import { useViewModel } from "@hook/useViewModel";
import { UserControl, UserControlConstructor } from "@/UserControl";


export function useUserControl<T extends UserControl>(vmCLS: UserControlConstructor<T>): T {
    return useViewModel(vmCLS);
}
import {ActionContext, ActionResult, ReadableGlobalContext, syncio} from "vue-mvvm";
import {DialogService} from "@/DialogProvider";
import {AlertControl, AlertControlConstructor, AlertComponentNotFoundError, AlertOptions} from "@/AlertControl";
import {ConfirmControl, ConfirmControlConstructor, ConfirmComponentNotFoundError, ConfirmOptions} from "@/ConfirmControl";

let alertControl: AlertControlConstructor | null;

export function setAlertControl(control: AlertControlConstructor | null): void {
    alertControl = control;
}

let confirmControl: ConfirmControlConstructor | null;

export function setConfirmControl(control: ConfirmControlConstructor | null): void {
    confirmControl = control;
}

export class AlertService {
    private dialogService: DialogService;

    public constructor(ctx: ReadableGlobalContext) {
        this.dialogService = ctx.getService(DialogService);
    }

    public async showAlert(options: AlertOptions): Promise<void> {
        if (!alertControl) {
            throw new AlertComponentNotFoundError();
        }

        const dialog: AlertControl = this.dialogService.initDialog(alertControl, options);
        await dialog.openDialog();

        await new Promise<ActionResult<void>>(async (resolve): Promise<void> => {
            const ctx: ActionContext<void> = new ActionContext(resolve);
            await syncio.ensureSync(dialog.onAction(ctx));
        });

        if (!dialog.destroyed.value) {
            dialog.destroy();
        }
    }

    public async showConfirm(options: ConfirmOptions): Promise<boolean> {
        if (!confirmControl) {
            throw new ConfirmComponentNotFoundError();
        }

        const dialog: ConfirmControl = this.dialogService.initDialog(confirmControl, options);
        await dialog.openDialog();

        const result: ActionResult<boolean> = await new Promise<ActionResult<boolean>>(async (resolve): Promise<void> => {
            const ctx: ActionContext<boolean> = new ActionContext(resolve);
            await syncio.ensureSync(dialog.onAction(ctx));
        });

        if (!dialog.destroyed.value) {
            dialog.destroy();
        }

        if (!result.success) {
            return false;
        }

        return result.data;
    }
}

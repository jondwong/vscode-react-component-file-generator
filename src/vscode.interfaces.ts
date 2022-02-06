import { InputBoxOptions, TextEditor } from "vscode";

export interface VSCodeWindow {
    showQuickPick(items: any, arg1: { canPickMany: boolean; placeHolder: string; title: string;}): string[] | PromiseLike<string[] | undefined> | undefined | any;
    showErrorMessage(message: string): Thenable<string>;
    showInformationMessage(message: string): Thenable<string>;
    showInputBox(options?: InputBoxOptions): Thenable<string | undefined>;
    activeTextEditor: TextEditor;
}

export interface IDisposable {
    dispose(): void;
}

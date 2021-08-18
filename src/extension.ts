// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import { commands, workspace, window, Uri, ExtensionContext } from "vscode";
import { ReactComponentFileGenerator } from "./react-component-generator";
import * as fs from "fs";
import * as path from "path";

export const getWorkspaceFolder = (folders: any): string => {
    if (!folders) {
        return "";
    }

    const folder = folders[0] || {};
    const uri = folder.uri;

    return uri.fsPath;
};

export function activate(context: ExtensionContext) {
    const workspaceRoot: string = getWorkspaceFolder(
        workspace.workspaceFolders
    );
    const generator = new ReactComponentFileGenerator(workspaceRoot, window);

    let disposable = commands.registerCommand(
        "react-component-file-generator.newComponent",
        (resource: Uri) => {
            if (resource) {
                let destinationPath = fs.lstatSync(resource.path).isDirectory()
                    ? resource.path
                    : path.dirname(resource.path);
                generator.execute({ destinationPath });
            } else {
                generator.execute({});
            }
        }
    );

    context.subscriptions.push(disposable);

    let copyDisposable = commands.registerCommand(
        "react-component-file-generator.copyComponent",
        (resource: Uri) => {
            if (resource) {
                generator.executeCopyComponent({ sourcePath: resource.path });
            }
        }
    );

    context.subscriptions.push(disposable);
    context.subscriptions.push(copyDisposable);
    context.subscriptions.push(generator);
}

// this method is called when your extension is deactivated
export function deactivate() {}

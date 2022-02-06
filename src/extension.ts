// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as fs from "fs";
import * as path from "path";
import { commands, workspace, window, Uri, ExtensionContext } from "vscode";
import { VSCodeWindow } from "./vscode.interfaces";
import {
    ReactComponentFileGenerator,
    CreateFromSelectionGenerator,
    CopyComponentGenerator,
    CreateStyledComponentGenerator,
} from "./generators";

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

    //@ts-ignore
    const generator = new ReactComponentFileGenerator(workspaceRoot, window);
    //@ts-ignore
    const createFromSelectionGenerator = new CreateFromSelectionGenerator(
        workspaceRoot,
        window as VSCodeWindow
    );
    const copyComponentGenerator = new CopyComponentGenerator(
        workspaceRoot,
        window as VSCodeWindow
    );

    const createStyledComponentGenerator = new CreateStyledComponentGenerator(
        workspaceRoot,
        window as VSCodeWindow
    );

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

    let copyDisposable = commands.registerCommand(
        "react-component-file-generator.copyComponent",
        (resource: Uri) => {
            if (resource) {
                copyComponentGenerator.execute({
                    sourcePath: resource.path,
                });
            }
        }
    );

    let createFromSelectionDisposable = commands.registerCommand(
        "react-component-file-generator.createComponentFromSelection",
        (resource: Uri) => {
            createFromSelectionGenerator.execute();
        }
    );

    let createStyledComponentDisposable = commands.registerCommand(
        "react-component-file-generator.createStyledComponentFromSelection",
        () => {
            createStyledComponentGenerator.execute();
        }
    );
    

    context.subscriptions.push(disposable);
    context.subscriptions.push(copyDisposable);
    context.subscriptions.push(createFromSelectionDisposable);
    context.subscriptions.push(createStyledComponentDisposable);
    context.subscriptions.push(generator);
    context.subscriptions.push(createFromSelectionGenerator);
    context.subscriptions.push(copyComponentGenerator);
    context.subscriptions.push(createStyledComponentGenerator);
}

// this method is called when your extension is deactivated
export function deactivate() {}

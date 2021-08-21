import * as path from "path";
import { VSCodeWindow, IDisposable } from "../vscode.interfaces";
import Prompts from "../utils/prompts";
import FileUtils from "../utils/files";

export default class ReactComponentFileGenerator implements IDisposable {
    constructor(private workspaceRoot: string, private window: VSCodeWindow) {}

    async execute(options: { destinationPath?: string }): Promise<void> {
        let componentName = await Prompts.promptForComponentName(this.window);

        let destinationPath: string | undefined = "";

        if (options && options.destinationPath) {
            destinationPath = options.destinationPath;
        } else {
            destinationPath = await Prompts.promptForDestinationPath(
                this.window
            );
        }

        const absDestPath: string = this.toAbsolutePath(destinationPath!);

        try {
            this.create(componentName!, absDestPath);
            this.window.showInformationMessage(
                `Component '${componentName}' successfully created`
            );
        } catch (err) {
            this.window.showErrorMessage(`Error: ${err.message}`);
        }
    }

    create(componentName: string, destPath: string) {
        try {
            let dirPath = FileUtils.createDirectoryForComponent(
                destPath,
                componentName
            );
            FileUtils.createComponentFilesAtPath(dirPath, componentName);
        } catch (err) {
            this.window.showErrorMessage(err);
            throw err;
        }
    }

    toAbsolutePath(nameOrRelativePath: string): string {
        return path.resolve(this.workspaceRoot, nameOrRelativePath);
    }

    dispose() {}
}

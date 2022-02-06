import * as path from "path";
import { VSCodeWindow, IDisposable } from "../vscode.interfaces";
import Prompts from "../utils/prompts";
import FileUtils from "../utils/files";
import StyleFormat from "../style_format";

export default class ReactComponentFileGenerator implements IDisposable {
    constructor(private workspaceRoot: string, private window: VSCodeWindow) {}

    async execute(options: { destinationPath?: string }): Promise<void> {
        let componentName = await Prompts.promptForComponentName(this.window);
        let styleFormatSelection = await this._showStyleSelectorPrompt();
        
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
            this.create(componentName!, absDestPath, styleFormatSelection);
            this.window.showInformationMessage(
                `Component '${componentName}' successfully created`
            );
        } catch (err) {
            this.window.showErrorMessage(`Error: ${err.message}`);
        }
    }

    create(componentName: string, destPath: string, styleFormat: StyleFormat) {
        try {
            let dirPath = FileUtils.createDirectoryForComponent(
                destPath,
                componentName
            );
            FileUtils.createComponentFilesAtPath(dirPath, componentName, styleFormat);
        } catch (err) {
            this.window.showErrorMessage(err);
            throw err;
        }
    }

    toAbsolutePath(nameOrRelativePath: string): string {
        return path.resolve(this.workspaceRoot, nameOrRelativePath);
    }

    dispose() {}

    async _showStyleSelectorPrompt():Promise<StyleFormat> {
        let stylePick = await this.window.showQuickPick(
            [
                {
                    alwaysShow: true,
                    buttons: [],
                    description: "Generate a [component].styles.ts file leveraging the styled-components package",
                    label: "Styled Component"
                },
                {
                    alwaysShow: true,
                    buttons: [],
                    description: "Generate a [component].scss file leveraging SCSS",
                    label: "SCSS"
                }
            ],
            {
                canPickMany: false,
                placeHolder: "Please select the method of styling for the component",
                title: "Style Selection"
            }
        );
        
        if( stylePick && stylePick.label == "SCSS") {
            return StyleFormat.SCSS;
        }

        return StyleFormat.STYLED_COMPONENT;
    }
}

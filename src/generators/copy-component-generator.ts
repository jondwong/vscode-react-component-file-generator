import * as path from "path";
import * as fs from "fs";
import * as replaceInFile from "replace-in-file";
import { IDisposable, VSCodeWindow } from "../vscode.interfaces";
import FileUtils from "../utils/files";
import Prompts from "../utils/prompts";
import { INDEX_FILE } from "../templates";

export default class CopyComponentGenerator implements IDisposable {
    constructor(private workspaceRoot: string, private window: VSCodeWindow) {}

    async execute(options: { sourcePath: string }) {
        try {
            if (!FileUtils.isDirectory(options.sourcePath)) {
                this.window.showErrorMessage(
                    `Error: ${options.sourcePath} is not a directory`
                );
                return;
            }

            let destinationPath = await Prompts.promptForDestinationPath(
                this.window
            );

            let componentName = path.basename(options.sourcePath);
            let dirPath = FileUtils.createDirectoryForComponent(
                path.resolve(this.workspaceRoot, destinationPath!),
                componentName
            );

            let files = fs.readdirSync(options.sourcePath);

            files.forEach((fileName: string) => {
                let fileNameElements: string[] = fileName.split(".");
                fileNameElements[0] = FileUtils.toKebabCase(
                    fileNameElements[0]
                );

                let newFileName = fileNameElements.join(".");

                fs.copyFileSync(
                    path.join(options.sourcePath, fileName),
                    path.join(dirPath, newFileName)
                );
            });

            this._replaceFileNames(
                path.basename(options.sourcePath),
                dirPath,
                path.basename(dirPath)
            );
            this._createIndexFileIfNeeded(dirPath, componentName);

            this.window.showInformationMessage(
                "Component successfully copied to destination!"
            );
        } catch (err) {
            this.window.showErrorMessage(`Error: ${err}`);
        }
    }

    private _replaceFileNames(
        fileName: string,
        basePath: string,
        replaceValue: string
    ) {
        const fileNameRegex = new RegExp(`\\/${fileName}`, "g");

        let results = replaceInFile.sync({
            files: path.join(basePath, "*"),
            from: fileNameRegex,
            to: `/${replaceValue}`,
            countMatches: true,
        });
    }

    private _createIndexFileIfNeeded(dirPath: string, componentName: string) {
        if (!FileUtils.exists(path.join(dirPath, "index.ts"))) {
            FileUtils.createIndexFile(dirPath, componentName);
        }
    }

    dispose() {}
}

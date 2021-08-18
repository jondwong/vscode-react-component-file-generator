import * as path from "path";
import * as fs from "fs";
import * as HandleBars from "handlebars";
import * as replaceInFile from "replace-in-file";
import { VSCodeWindow } from "./vscode.interfaces";
import { InputBoxOptions } from "vscode";
import { COMPONENT_FILE, STYLES_FILE, INDEX_FILE } from "./templates";

export interface IDisposable {
    dispose(): void;
}

interface FileGenerator {
    getFileName: (base: string) => string;
    template: string;
    getTemplateArgs: (componentName: string, fileName: string) => object;
}

export class ReactComponentFileGenerator implements IDisposable {
    private filesToGenerate: FileGenerator[] = [
        {
            getFileName: (base: string): string => `${base}.tsx`,
            template: COMPONENT_FILE,
            getTemplateArgs: (componentName: string, fileName: string) => ({
                componentName,
                fileName,
            }),
        },
        {
            getFileName: (base: string): string => `${base}.styles.ts`,
            template: STYLES_FILE,
            getTemplateArgs: (componentName: string, fileName: string) => ({
                componentName,
            }),
        },
        {
            getFileName: (base: string): string => `index.ts`,
            template: INDEX_FILE,
            getTemplateArgs: (componentName: string, fileName: string) => ({
                fileName,
            }),
        },
    ];

    constructor(private workspaceRoot: string, private window: VSCodeWindow) {}

    async executeCopyComponent(options: { sourcePath: string }): Promise<void> {
        if (!fs.lstatSync(options.sourcePath).isDirectory()) {
            this.window.showErrorMessage(
                `Error: ${options.sourcePath} is not a directory`
            );
            return;
        }

        let destinationPath = await this.prompt({
            ignoreFocusOut: true,
            prompt: `Enter the parent path relative to your workspace root that you'd like your files to be copied.`,
            placeHolder: "path/to/your/file , i.e. projecta/src/components",
            validateInput: this.validate,
        });

        let newDirName = this.toKebabCase(path.basename(options.sourcePath));
        let newDirPath = path.resolve(
            this.workspaceRoot,
            destinationPath!,
            newDirName
        );

        if (fs.existsSync(newDirPath)) {
            this.window.showErrorMessage(
                `${newDirName} already exists at ${newDirPath}`
            );
            return;
        }
        try {
            fs.mkdirSync(newDirPath);

            let files = fs.readdirSync(options.sourcePath);

            files.forEach((file) => {
                let fileNameElements: string[] = file.split(".");

                fileNameElements[0] = this.toKebabCase(fileNameElements[0]);

                let newFileName = fileNameElements.join(".");

                fs.copyFileSync(
                    path.join(options.sourcePath, file),
                    path.join(newDirPath, newFileName)
                );
            });

            const fileNameRegex = new RegExp(
                `\\/${path.basename(options.sourcePath)}`,
                "g"
            );

            let results = replaceInFile.sync({
                files: path.join(newDirPath, "*"),
                from: fileNameRegex,
                to: `/${newDirName}`,
                countMatches: true,
            });

            if (!fs.existsSync(path.join(newDirPath, "index.ts"))) {
                const template = HandleBars.compile(INDEX_FILE);
                fs.writeFileSync(
                    path.join(newDirPath, "index.ts"),
                    template({ fileName: newDirName })
                );

                this.window.showInformationMessage(
                    "Generated index.ts file for new component"
                );
            }

            this.window.showInformationMessage(
                "Component successfully copied to destination!"
            );
        } catch (err) {
            this.window.showErrorMessage(`Failed to copy component: ${err}`);
        }
    }

    async execute(options: { destinationPath?: string }): Promise<void> {
        let componentName = await this.prompt({
            ignoreFocusOut: true,
            prompt: `Enter the name of the component you wish to generate.'`,
            placeHolder: "Should be camelcased, i.e. UserImageBox or TodoList",
            validateInput: this.validate,
        });

        let destinationPath: string | undefined = "";

        if (options && options.destinationPath) {
            destinationPath = options.destinationPath;
        } else {
            destinationPath = await this.prompt({
                ignoreFocusOut: true,
                prompt: `Enter the parent path relative to your workspace root`,
                placeHolder: "path/to/your/file , i.e. src/components",
                validateInput: this.validate,
            });
        }
        let kebabCased = this.toKebabCase(componentName!);

        const directoryPath: string = this.toAbsolutePath(
            path.join(destinationPath!, kebabCased)
        );

        try {
            this.create(componentName!, directoryPath);
            this.window.showInformationMessage(
                `Component '${componentName}' successfully created`
            );
        } catch (err) {
            this.window.showErrorMessage(`Error: ${err.message}`);
        }
    }

    async prompt(options: InputBoxOptions): Promise<string | undefined> {
        return await this.window.showInputBox(options);
    }

    toKebabCase(componentName: string): string {
        let regex =
            /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g;

        return componentName
            .match(regex)!
            .map((x) => x.toLowerCase())
            .join("-");
    }

    create(componentName: string, directoryPath: string) {
        if (fs.existsSync(directoryPath)) {
            throw new Error(`'${directoryPath}' already exists`);
        }

        try {
            // create the directory
            fs.mkdirSync(directoryPath);
            let componentFileNameRoot = path.basename(directoryPath);

            this.filesToGenerate.forEach((generator: FileGenerator) => {
                let fileName = generator.getFileName(componentFileNameRoot);
                const template = HandleBars.compile(generator.template);
                const fullpath = path.join(directoryPath, fileName);
                fs.writeFileSync(
                    fullpath,
                    template(
                        generator.getTemplateArgs(
                            componentName,
                            componentFileNameRoot
                        )
                    )
                );
            });
        } catch (err) {
            console.log("Error", err.message);
            throw err;
        }
    }
    validate(name: string): string | null {
        return null;
    }

    toAbsolutePath(nameOrRelativePath: string): string {
        return path.resolve(this.workspaceRoot, nameOrRelativePath);
    }

    dispose() {}
}

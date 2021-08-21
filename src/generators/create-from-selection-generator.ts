import { InputBoxOptions } from "vscode";
import * as path from "path";
import { ModuleImport } from "../types";
import { IDisposable, VSCodeWindow } from "../vscode.interfaces";
import Prompts from "../utils/prompts";
import FileUtil from "../utils/files";

const JSX_COMPONENT_REGEX = /<(?<styles>Styles\.)?(?<el>[A-Z][A-Za-z]*).*/;
const FILE_IMPORT_STATEMENT_REGEX = /(import (.*) from [\'|\"](.*)[\'|\"])/gi;
const FILE_IMPORT_ELEMENTS_REGEX =
    /(?:(?<default>[A-Za-z]*),\s)?(?:\{\s*(?<exports>.*)\s*\})|(?<defaultOnly>[A-Za-z]*)/;

const STYLED_COMPONENT_REGEX =
    /(?<fullComponent>^(?:export )?(?:const|let|var) (?<componentName>[A-Za-z]+) = styled[^`]*`[^`]*`)/gms;

export default class CreateFromSelectionGenerator implements IDisposable {
    constructor(private workspaceRoot: string, private window: VSCodeWindow) {}

    async execute() {
        try {
            let componentName = await Prompts.promptForComponentName(
                this.window
            );
            let destinationPath = await Prompts.promptForDestinationPath(
                this.window
            );

            let selection = this._getSelectedText();
            let jsxComponents = this._getComponentsFromSelection(selection);
            let documentText = this.window.activeTextEditor.document.getText();
            let imports: ModuleImport[] = this._getRequiredModuleImports(
                jsxComponents,
                documentText
            );

            console.log("jsx components = ", jsxComponents);
            console.log("imports = ", imports);
            imports.forEach((i: ModuleImport) => {});

            let styledComponentsInFile =
                this._getStyledComponentsForCurrentFile();

            let styledComponentsInComponent: string[] = [];

            Object.keys(jsxComponents).forEach((componentName) => {
                if (
                    jsxComponents[componentName].isStyle &&
                    styledComponentsInFile[componentName]
                ) {
                    styledComponentsInComponent.push(
                        styledComponentsInFile[componentName]
                    );
                }
            });

            let dirPath = FileUtil.createDirectoryForComponent(
                path.resolve(this.workspaceRoot, destinationPath!),
                componentName!
            );

            FileUtil.createComponentFile(dirPath, componentName!, {
                imports,
                body: selection,
            });

            FileUtil.createStylesFile(dirPath, componentName!, {
                additionalComponents: styledComponentsInComponent,
            });
            FileUtil.createIndexFile(dirPath, componentName!);
            this.window.showInformationMessage(
                `Component: ${componentName!} created from selection at ${dirPath}`
            );
        } catch (err) {
            this.window.showErrorMessage(
                `Failed to create component, error = ${err}`
            );
        }
    }

    private _getRequiredModuleImports(
        components: Record<string, string>,
        documentText: string
    ): ModuleImport[] {
        let moduleImports: ModuleImport[] = [];
        let match;
        while (
            (match = FILE_IMPORT_STATEMENT_REGEX.exec(documentText)) !== null
        ) {
            let source = path.resolve(
                path.dirname(this.window.activeTextEditor.document.uri.fsPath),
                match[3]
            );

            console.log(source);
            let required = false;
            let moduleExportsText = match[2];
            let moduleImport: ModuleImport = {
                source,
                exports: [],
                default: "",
            };
            let exports = this._getExports(moduleExportsText);

            if (exports!.defaultExport && components[exports!.defaultExport]) {
                moduleImport["default"] = exports!.defaultExport;
                required = true;
            }

            moduleImport.exports = Object.keys(components).filter((c) =>
                exports!.exports.includes(c)
            );

            if (moduleImport.exports.length > 0) {
                required = true;
            }
            if (required) {
                moduleImports.push(moduleImport);
            }
            required = false;
        }

        return moduleImports;
    }

    private _getExports(moduleExportsText: string) {
        let match = FILE_IMPORT_ELEMENTS_REGEX.exec(moduleExportsText);
        if (match) {
            let groups = match.groups!;
            let defaultExport = groups.default || groups.defaultOnly;
            let exports = groups.exports
                ? groups.exports.split(/\s*,\s*/).map((e) => e.trim())
                : [];

            return { defaultExport, exports };
        }
        return null;
    }
    private _getSelectedText(): string {
        return this.window.activeTextEditor.document.getText(
            this.window.activeTextEditor.selection
        );
    }

    private _getComponentsFromSelection(selected: string) {
        let lines = selected.split("\n");
        return lines.reduce((acc: any, line: string) => {
            let componentMatch = JSX_COMPONENT_REGEX.exec(line);
            if (componentMatch && componentMatch.groups!.el) {
                acc[componentMatch.groups!.el] = {
                    isStyle: !!componentMatch.groups!.styles,
                };
            }
            return acc;
        }, {});
    }

    private _getStyledComponentsForCurrentFile(): Record<string, string> {
        /* Find and read the styles file */
        let currentFilePath = this.window.activeTextEditor.document.uri.fsPath;
        let dirPath = path.dirname(currentFilePath);
        let filesInDir = FileUtil.getFileNamesInDir(dirPath);

        let styleFilePaths = filesInDir
            .filter((f) => f.indexOf(".styles.ts") !== -1)
            .map((f) => path.join(dirPath, f));

        let styledComponents = styleFilePaths.reduce((prev, fp: string) => {
            let fileContent = FileUtil.getFileContent(fp);
            STYLED_COMPONENT_REGEX;
            let styledComponentsInFile: Record<string, string> = {};
            let match;
            while (
                (match = STYLED_COMPONENT_REGEX.exec(fileContent)) !== null
            ) {
                styledComponentsInFile[match.groups!.componentName] =
                    match.groups!.fullComponent;
            }

            prev = {
                ...prev,
                ...styledComponentsInFile,
            };
            return prev;
        }, {});

        return styledComponents;
    }
    dispose() {}
}

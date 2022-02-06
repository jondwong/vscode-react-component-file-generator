import * as path from "path";
import { VSCodeWindow, IDisposable } from "../vscode.interfaces";
import Prompts from "../utils/prompts";
import FileUtils from "../utils/files";
import {
    workspace,
    window,
    Uri,
    TextDocument,
    ViewColumn,
    Range,
    TextEditor,
} from "vscode";
const JSX_COMPONENT_REGEX = /<?(?<styles>Styles\.)?(?<el>[A-Z][A-Za-z]*).*/;

export default class CreateStyledComponentGenerator implements IDisposable {
    constructor(private workspaceRoot: string, private window: VSCodeWindow) {}

    public async execute() {
        let selectedText = this.window.activeTextEditor.document.getText(
            this.window.activeTextEditor.selection
        );

        let match = JSX_COMPONENT_REGEX.exec(selectedText);
        if (match) {
            if (match.groups && match.groups!.el) {
                let content =
                    "\n\nexport const " +
                    match.groups!.el +
                    " = styled.div``\n";
                let styleFilePath = await this._getStylesFilePath();
                FileUtils.appendToFile(styleFilePath, content);
                window
                    .showTextDocument(Uri.parse(`${styleFilePath}`), {
                        viewColumn: ViewColumn.Beside,
                    })
                    .then((editor: TextEditor) => {
                        let lastLine = editor.document.lineAt(
                            editor.document.lineCount - 1
                        );
                        editor.revealRange(lastLine.range);
                    });
            }
        } else {
            this.window.showErrorMessage(
                "Failed to recognize a component name"
            );
        }
    }

    async _getStylesFilePath() {
        let activeFilePath = this.window.activeTextEditor.document.uri.fsPath;
        let parsedPath = path.parse(activeFilePath);
        let styledFilePath = path.join(
            parsedPath.dir,
            `${parsedPath.name}.styles.ts`
        );
        if (!FileUtils.exists(styledFilePath)) {
            styledFilePath = path.resolve(
                this.workspaceRoot,
                (await Prompts.promptForDestinationPath(
                    this.window,
                    "Enter the full path to your styles file."
                )) || ""
            );
            if (!FileUtils.exists(styledFilePath)) {
                throw `No file exists at provided path: ${styledFilePath}`;
            }
        }

        return styledFilePath;
    }

    dispose() {}
}

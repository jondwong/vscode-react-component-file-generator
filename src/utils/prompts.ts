import { InputBoxOptions } from "vscode";
import { VSCodeWindow } from "../vscode.interfaces";

const promptForComponentName = async (window: VSCodeWindow) => {
    return await _launchPrompt(window, {
        ignoreFocusOut: true,
        prompt: `Enter the name of the component you wish to generate.'`,
        placeHolder: "Should be camelcased, i.e. UserImageBox or TodoList",
        validateInput: (input: string) => null,
    });
};

const promptForDestinationPath = async (
    window: VSCodeWindow,
    prompt?: string
) => {
    return await _launchPrompt(window, {
        ignoreFocusOut: true,
        prompt:
            prompt || `Enter the parent path relative to your workspace root`,
        placeHolder: "path/to/your/file , i.e. src/components",
        validateInput: (input: string) => null,
    });
};

const _launchPrompt = async (
    window: VSCodeWindow,
    options: InputBoxOptions
): Promise<string | undefined> => {
    return await window.showInputBox(options);
};

export default {
    promptForComponentName,
    promptForDestinationPath,
};

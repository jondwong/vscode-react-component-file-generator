import * as path from "path";
import * as fs from "fs";
import { COMPONENT_FILE, INDEX_FILE, STYLED_COMPONENT_STYLE_FILE, SCSS_STYLE_FILE } from "../templates";
import { ModuleImport } from "../types";
import * as Handlebars from "handlebars";
import StyleFormat from "../style_format";


Handlebars.registerHelper("encodeMyString", function (inputData) {
    return new Handlebars.SafeString(inputData);
});

Handlebars.registerHelper("uncapitalize", function (inputData) {
    return uncapitalize(inputData);
});

export const isDirectory = (path: string): boolean => {
    return fs.lstatSync(path).isDirectory();
};

export const exists = (path: string): boolean => {
    return fs.existsSync(path);
};

export const toKebabCase = (input: string): string => {
    let regex =
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g;

    return input
        .match(regex)!
        .map((x) => x.toLowerCase())
        .join("-");
};

export const getFileContent = (filePath: string): string => {
    return fs.readFileSync(filePath).toString();
};

const createComponentFile = (
    parentPath: string,
    componentName: string,
    options: {
        imports?: ModuleImport[];
        body?: string;
        styleFormat: StyleFormat
    }
) => {
    const template = Handlebars.compile(COMPONENT_FILE);
    let fileName = toKebabCase(componentName);
    let filePath = path.join(parentPath, `${fileName}.tsx`);

    if (exists(filePath)) {
        throw `Path for component file already exists as ${filePath}`;
    }

    let importsText = options.imports
        ? options.imports.map((i: ModuleImport) => {
              let importElements = [];
              if (i.default) {
                  importElements.push(i.default);
              }
              if (i.exports && i.exports.length > 0) {
                  importElements.push(`{ ${i.exports.join(", ")} }`);
              }

              return `import ${importElements.join(", ")} from '${path.relative(
                  path.dirname(filePath),
                  i.source
              )}'`;
          })
        : [];

    let styleImportStatement = options.styleFormat == StyleFormat.STYLED_COMPONENT ? `import * as Styles from "./${toKebabCase(componentName)}.styles"` : `import './${toKebabCase(componentName)}.scss'`;
    let baseComponentOpenTag = options.styleFormat == StyleFormat.STYLED_COMPONENT ? `Styles.${componentName}Wrapper` : `div className="${uncapitalize(componentName)}"`;
    let baseComponentCloseTag = options.styleFormat == StyleFormat.STYLED_COMPONENT ? `Styles.${componentName}Wrapper` : `div`;
    let args = {
        styleImportStatement,
        baseComponentOpenTag,
        baseComponentCloseTag,
        componentName,
        fileName: toKebabCase(componentName),
        imports: importsText,
        componentBody: options.body || "",
    };
    _createFile(filePath, template(args));
};

const uncapitalize = (input:string) => {
    if(!input) {return input;};
    return input.charAt(0).toLowerCase() + input.slice(1);
};

const capitalize = (input:string) => {
    if(!input) {return input;}
    return input.charAt(0).toUpperCase() + input.slice(1);
};

const createStylesFile = (
    parentPath: string,
    componentName: string,
    options?: { additionalComponents?: string[], styleFormat?:StyleFormat }
) => {
    let fileName = toKebabCase(componentName);
    

    if(!options || !("styleFormat" in options) || options.styleFormat == StyleFormat.STYLED_COMPONENT) {
        const template = Handlebars.compile(STYLED_COMPONENT_STYLE_FILE);
        let args = {
            componentName,
            additionalComponents: options ? options.additionalComponents || [] : [],
        };
    
        _createFile(path.join(parentPath, `${fileName}.styles.ts`), template(args));
    } else {
        const template = Handlebars.compile(SCSS_STYLE_FILE);
        _createFile(path.join(parentPath, `${fileName}.scss`), template({componentName}));
    }
};

const createIndexFile = (parentPath: string, componentName: string) => {
    let fileName = toKebabCase(componentName);
    let filePath = path.join(parentPath, `index.ts`);

    if (exists(filePath)) {
        throw `Path for component index file already exists as ${filePath}`;
    }

    const template = Handlebars.compile(INDEX_FILE);
    _createFile(filePath, template({ fileName }));
};

const createComponentFilesAtPath = (
    destinationDirectoryPath: string,
    componentName: string,
    styleFormat: StyleFormat
) => {
    componentName = capitalize(componentName);
    createComponentFile(destinationDirectoryPath, componentName, { styleFormat});
    createStylesFile(destinationDirectoryPath, componentName, {styleFormat});
    createIndexFile(destinationDirectoryPath, componentName);
};

const createDirectoryForComponent = (
    destinationPath: string,
    componentName: string
): string => {
    let dirName = toKebabCase(componentName);
    let dirPath = path.join(destinationPath, dirName);
    if (exists(dirPath)) {
        throw `Directory already exists at ${dirPath}`;
    }
    fs.mkdirSync(dirPath);
    return dirPath;
};

const appendToFile = (filePath: string, content: string) => {
    fs.appendFileSync(filePath, content);
};

const getFileNamesInDir = (dirPath: string) => {
    return fs.readdirSync(dirPath);
};

const _anyExist = (filePaths: string[]): boolean => {
    return filePaths.every((fp: string) => exists(fp));
};

const _createFile = (path: string, fileContent: string) => {
    if (exists(path)) {
        throw `Path for file already exists as ${path}`;
    }
    return fs.writeFileSync(path, fileContent);
};

export default {
    isDirectory,
    toKebabCase,
    exists,
    createComponentFile,
    createIndexFile,
    createStylesFile,
    createComponentFilesAtPath,
    createDirectoryForComponent,
    getFileNamesInDir,
    getFileContent,
    appendToFile,
};

import * as path from "path";
import * as fs from "fs";
import { COMPONENT_FILE, INDEX_FILE, STYLES_FILE } from "../templates";
import { ModuleImport } from "../types";
import * as Handlebars from "handlebars";

Handlebars.registerHelper("encodeMyString", function (inputData) {
    return new Handlebars.SafeString(inputData);
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

    let args = {
        componentName,
        fileName: toKebabCase(componentName),
        imports: importsText,
        componentBody: options.body || "",
    };
    _createFile(filePath, template(args));
};

const createStylesFile = (
    parentPath: string,
    componentName: string,
    options?: { additionalComponents?: string[] }
) => {
    let fileName = toKebabCase(componentName);
    let filePath = path.join(parentPath, `${fileName}.styles.ts`);

    if (exists(filePath)) {
        throw `Path for styles file already exists as ${filePath}`;
    }
    const template = Handlebars.compile(STYLES_FILE);
    let args = {
        componentName,
        additionalComponents: options ? options.additionalComponents || [] : [],
    };
    console.log(args);
    _createFile(filePath, template(args));
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
    componentName: string
) => {
    createComponentFile(destinationDirectoryPath, componentName, {});
    createStylesFile(destinationDirectoryPath, componentName);
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

export interface ModuleImport {
    source: string;
    default: string | undefined | null;
    exports: string[];
}

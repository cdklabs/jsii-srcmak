export interface CommonOptions {
  /**
   * The relative path of the .ts entrypoint within the source directory.
   * @default "index.ts"
   */
  entrypoint?: string;

  /**
   * List of directories that include node modules to symlink into the compiled
   * package. For example, if your generated code references some library, you
   * should include it's module directory in here.
   */
  moduleDirs?: string[];

  /**
   * Path to output the .jsii file output.
   * @default - jsii file is not emitted.
   */
  outputJsii?: string;
}

export interface PythonOptions extends CommonOptions {
  /**
   * The name of the the python module to generate. If omitted python will not be generated.
   */
  pythonName?: string;
}

export type Options = PythonOptions; /* | JavaOptions | DotNetOptions */
export interface Options {
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
  deps?: string[];

  /**
   * Save .jsii file to an output location.
   * @default - jsii manifest is omitted.
   */
  jsii?: JsiiOutputOptions;

  /**
   * Produce python code.
   * @default - python is not generated
   */
  python?: PythonOutputOptions;

  /**
   * Produce java code.
   * @default - java is not generated
   */
  java?: JavaOutputOptions;
}

export interface JsiiOutputOptions {
  /**
   * Path to save the .jsii output to.
   */
  path: string;
}

export interface PythonOutputOptions {
  /**
   * Base root directory.
   */
  outdir: string;

  /**
   * The name of the the python module to generate.
   */
  moduleName: string;
}

export interface JavaOutputOptions {
  /**
   * Base root directory.
   */
  outdir: string;

  /**
   * The name of the java package to generate
   */
  package: string;
}

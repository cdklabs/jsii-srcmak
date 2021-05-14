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
   * Key for the module to prevent JSII collisions.
   *
   * Use your own if it's project-unique, otherwise use default.
   *
   * @default - hash of the basepath to the module
   */
  moduleKey?: string;

  /**
   * Produce python code.
   * @default - python is not generated
   */
  python?: PythonOutputOptions;

  /**
   * Produces java code under src/main/
   *
   * @default - java is not generated
   */
  java?: JavaOutputOptions;

  /**
   * Produces C# code.
   *
   * @default - C# is not generated
   */
  csharp?: CSharpOutputOptions;

  /**
   * Produces Golang code.
   * 
   * @default - go is not generated
   */
  golang?: GoLangOutputOptions;
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
   *
   * This must follow the standard Python module name conventions.
   * For example, it cannot include a hyphen ('-')
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
   *
   * This must follow standard Java package conventions.
   * For example, it cannot include a hyphen ('-')
   */
  package: string;
}

export interface CSharpOutputOptions {
  /**
   * Base root directory.
   */
  outdir: string;

  /**
   * The root namespace to generate types in
   *
   * This must follow standard C# namespace conventions.
   * For example, it cannot include a hyphen ('-')
   */
  namespace: string;
}

export interface GoLangOutputOptions {
  /**
   * Base root directory.
   */
  outdir: string;

  /**
   * The go module name
   *
   * The name of the target repository for this module (e.g. github.com/foo/bar)
   *
   * This must follow standard Go module name conventions.
   * For example, it cannot include an underscore ('_') or be camelCased
   */
  moduleName: string;

  /**
   * The name of the Go package.
   *
   * E.g. "tools" would result in something like github.com/foo/bar/tools
   * depeding on the supplied moduleName
   */
  packageName: string;
}

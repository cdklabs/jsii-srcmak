export interface Options {
  /**
   * The relative path of the .ts entrypoint within the source directory.
   * @default "index.ts"
   */
  entrypoint?: string;

  /**
   * The name of the the python module to generate. If omitted python will not be generated.
   */
  pythonName?: string;

  /**
   * List of module names to compile against. These modules must be resolvable
   * against the current executable and their version will be the same version.
   */
  modules?: string[];
}

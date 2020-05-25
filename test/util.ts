import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Returns a dictionary where keys are relative file names and values are the
 * file contents. Useful to perform snapshot testing against full directories.
 */
export async function snapshotDirectory(basedir: string, exclude: string[] = [], reldir = '.'): Promise<Record<string, string>> {
  const result: Record<string, string> = { };
  const absdir = path.join(basedir, reldir);
  for (const file of await fs.readdir(absdir)) {
    if (exclude.includes(file)) {
      continue; // skip
    }

    const abspath = path.join(absdir, file);
    const relpath = path.join(reldir, file);

    if ((await fs.stat(abspath)).isDirectory()) {
      const subdir = await snapshotDirectory(basedir, exclude, relpath);
      for (const [k, v] of Object.entries(subdir)) {
        result[k] = v;
      }
      continue;
    }

    const data = await fs.readFile(abspath, 'utf-8');
    result[relpath] = data;
  }

  return result;
}
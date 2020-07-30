import * as fs from 'fs-extra';
import * as path from 'path';

interface SnapshotOptions {
  excludeLines?: RegExp[];
  excludeFiles?: string[];
}

/**
 * Returns a dictionary where keys are relative file names and values are the
 * file contents. Useful to perform snapshot testing against full directories.
 */
export async function snapshotDirectory(basedir: string, excludeOptions: SnapshotOptions = {}, reldir = '.'): Promise<Record<string, string>> {
  const result: Record<string, string> = { };
  const absdir = path.join(basedir, reldir);
  const { excludeLines, excludeFiles } = excludeOptions;
  for (const file of await fs.readdir(absdir)) {
    let skip = false
    excludeFiles?.forEach((excludeFile) => {
      if (file.includes(excludeFile)) {
        skip = true;
      }
    });
    if (skip) {
      continue;
    }

    const abspath = path.join(absdir, file);
    const relpath = path.join(reldir, file);

    if ((await fs.stat(abspath)).isDirectory()) {
      const subdir = await snapshotDirectory(basedir, excludeOptions, relpath);
      for (const [k, v] of Object.entries(subdir)) {
        result[k] = v;
      }
      continue;
    }

    let data = await fs.readFile(abspath, 'utf-8');
    for (const excludeLine of excludeLines || []) {
      data = data.replace(excludeLine, '');
    }

    result[relpath] = data;
  }

  return result;
}
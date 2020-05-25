import * as fs from 'fs-extra';
import * as path from 'path';
import { withTempDir, exec } from './util';
import { compile } from './compile';
import { Options } from './options';

const pacmakModule = require.resolve('jsii-pacmak/bin/jsii-pacmak');

export async function srcmak(srcdir: string, targetdir: string, options: Options) {
  srcdir = path.resolve(srcdir);
  targetdir = path.resolve(targetdir);

  await withTempDir('jsii-codemak', async () => {
    // copy sources to temp directory
    await fs.copy(srcdir, '.');

    // perform jsii compilation
    await compile('.', options);

    // run pacmak to generate code
    await exec(pacmakModule, [ '--code-only' ]);

    // extract code based on selected languages
    if (options.pythonName) {
      const reldir = options.pythonName.replace(/\./g, '/'); // replace "." with "/"
      const source = path.resolve(`dist/python/src/${reldir}`);
      const target = path.join(targetdir, reldir);
      await fs.move(source, target, { overwrite: true });
    }
  });
}

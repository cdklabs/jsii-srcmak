import * as fs from 'fs-extra';
import * as path from 'path';
import { exec, mkdtemp } from './util';
import { compile } from './compile';
import { Options } from './options';

const pacmakModule = require.resolve('jsii-pacmak/bin/jsii-pacmak');

export async function srcmak(srcdir: string, options: Options = { }) {
  if (!(await fs.pathExists(srcdir))) {
    throw new Error(`unable to find source directory ${srcdir}`);
  }

  await mkdtemp(async workdir => {
    // copy sources to temp directory
    await fs.copy(srcdir, workdir);

    // perform jsii compilation
    await compile(workdir, options);

    // extract .jsii if requested
    if (options.jsii) {
      await fs.copy(path.join(workdir, '.jsii'), options.jsii.path);
    }

    // run pacmak to generate code
    await exec(pacmakModule, [ '--code-only' ], { cwd: workdir });

    // extract code based on selected languages
    if (options.python) {
      const reldir = options.python.moduleName.replace(/\./g, '/'); // jsii replaces "." with "/"
      const source = path.resolve(path.join(workdir, 'dist/python/src', reldir));
      const target = path.join(options.python.outdir, reldir);
      await fs.move(source, target, { overwrite: true });
    }
  });
}

import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from './util';
import { Options } from './options';

const compilerModule = require.resolve('jsii/bin/jsii');

/**
 * Compiles the source files in `workdir` with jsii.
 */
export async function compile(workdir: string, options: Options) {
  const args = [ '--silence-warnings', 'reserved-word' ];
  const entrypoint = options.entrypoint ?? 'index.ts';

  if (path.extname(entrypoint) !== '.ts') {
    throw new Error(`jsii entrypoint must be a .ts file: ${entrypoint}`);
  }

  // path to entrypoint without extension
  const basepath = path.join(path.dirname(entrypoint), path.basename(entrypoint, '.ts'));

  // jsii modules to include
  const modules = options.modules ?? [];

  const targets: Record<string, any> = { };

  const deps: Record<string, string> = { };
  for (const mod of modules) {
    if (mod.startsWith('@types/')) {
      continue;
    }

    deps[mod] = '*';
  }

  const pkg = {
    name: 'generated',
    version: '0.0.0',
    author: 'generated@generated.com',
    main: `${basepath}.js`,
    types: `${basepath}.d.ts`,
    license: 'Apache-2.0',
    repository: { url: 'http://generated', type: 'git' },
    jsii: {
      outdir: 'dist',
      targets: targets,
    },
    dependencies: deps,
    peerDependencies: deps,
  };

  if (options.pythonName) {
    targets.python = {
      distName: 'generated',
      module: options.pythonName,
    };
  }

  for (const mod of modules) {
    const sourcedir = path.dirname(require.resolve(`${mod}/package.json`));
    await fs.mkdirp(path.join(workdir, path.join('node_modules', path.dirname(mod))));
    await fs.ensureSymlink(sourcedir, path.join(workdir, 'node_modules', mod));
  }

  await fs.writeFile(path.join(workdir, 'package.json'), JSON.stringify(pkg, undefined, 2));

  await exec(compilerModule, args, {
    cwd: workdir,
  });
}

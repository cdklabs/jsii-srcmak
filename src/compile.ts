import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from './util';
import { Options } from './options';
import * as crypto from 'crypto';

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

  if (!(await fs.pathExists(path.join(workdir, entrypoint)))) {
    throw new Error(`unable to find typescript entrypoint: ${path.join(workdir, entrypoint)}`);
  }

  // path to entrypoint without extension
  const basepath = path.join(path.dirname(entrypoint), path.basename(entrypoint, '.ts'));

  const packageName = options.packageName?.replace(/\./g, '').replace(/\//g, '') ?? crypto.createHash('sha256').update(basepath, 'utf8').digest('hex');

  // jsii modules to include
  const moduleDirs = options.deps ?? [];

  const targets: Record<string, any> = { };

  const deps: Record<string, string> = { };

  for (const dir of moduleDirs) {
    // read module metadata
    const metadata = await fs.readJson(path.join(dir, 'package.json'));
    const moduleName: string = metadata.name;
    const moduleVersion: string = metadata.version;

    const targetdir = path.join(path.join(workdir, 'node_modules'), moduleName);
    await fs.mkdirp(path.dirname(targetdir));
    await fs.ensureSymlink(dir, targetdir);

    // add to "deps" and "peer deps"
    if (!moduleName.startsWith('@types/')) {
      deps[moduleName] = moduleVersion;
    }
  }

  const pkg = {
    name: packageName,
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

  if (options.python) {
    targets.python = {
      distName: 'generated',
      module: options.python.moduleName.replace(/-/g, '_'),
    };
  }

  if (options.java) {
    targets.java = {
      package: options.java.package,
      maven: {
        groupId: 'generated',
        artifactId: 'generated',
      },
    };
  }

  await fs.writeFile(path.join(workdir, 'package.json'), JSON.stringify(pkg, undefined, 2));

  await exec(compilerModule, args, {
    cwd: workdir,
  });
}

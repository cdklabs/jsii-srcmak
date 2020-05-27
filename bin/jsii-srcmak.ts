import { srcmak } from '../lib';
import * as yargs from 'yargs';

async function main() {
  const args = yargs
    .usage('$0 SRCDIR [OPTIONS]')
    .option('entrypoint', { desc: 'typescript entrypoint (relative to SRCDIR)', default: 'index.ts' })
    .option('dep', { desc: 'node module directories to include in compilation', type: 'array', string: true })
    .option('jsii-path', { desc: 'write .jsii output to this path', type: 'string' })
    .option('python-outdir', { desc: 'python output directory (requires --python-module-name)', type: 'string' })
    .option('python-module-name', { desc: 'python module name', type: 'string' })
    .option('java-outdir', { desc: 'java output directory (requires --java-package-name and --java-maven-group-id)', type: 'string' })
    .option('java-package-name', { desc: 'java package name', type: 'string' })
    .option('java-maven-group-id', { desc: 'java maven group id', type: 'string' })
    .option('java-maven-artifact-id', { desc: 'java maven artifact id', type: 'string' })
    .showHelpOnFail(true)
    .help();

  const argv = args.argv;

  if (argv._.length !== 1) {
    args.showHelp();
    console.error();
    console.error('Invalid number of arguments. expecting a single positional argument.');
    process.exit(1);
  }

  const srcdir = argv._[0];
  await srcmak(srcdir, {
    entrypoint: argv.entrypoint,
    ...parseDepOption(),
    ...parseJsiiOptions(),
    ...parsePythonOptions(),
    ...parseJavaOptions(),
  });

  function parseJsiiOptions() {
    const jsiiPath = argv['jsii-path'];
    if (!jsiiPath) { return undefined; }
    return {
      jsii: {
        path: jsiiPath,
      },
    }
  }

  function parsePythonOptions() {
    const outdir = argv['python-outdir'];
    const moduleName = argv['python-module-name'];
    if (!outdir && !moduleName) { return undefined; }
    if (!outdir) { throw new Error('--python-outdir is required if --python-module-name is specified'); }
    if (!moduleName) { throw new Error('--python-module-name is required if --python-outdir is specified'); }
    return {
      python: {
        outdir: outdir,
        moduleName: moduleName,
      },
    }
  }

  function parseJavaOptions() {
    const outdir = argv['java-outdir'];
    const packageName = argv['java-package-name'];
    const mavenGroupId = argv['java-maven-group-id'];
    const mavenArtifactId = argv['java-maven-artifact-id'];
    if (!outdir && !packageName && !mavenGroupId) { return undefined; }
    if (!outdir) { throw new Error('--java-outdir is required'); }
    if (!packageName) { throw new Error('--java-package-name is required'); }
    if (!mavenGroupId) { throw new Error('--java-maven-group-id is required'); }
    return {
      java: {
        outdir: outdir,
        package: packageName,
        maven: {
          groupId: mavenGroupId,
          artifactId: mavenArtifactId,
        },
      },
    }
  }

  function parseDepOption() {
    if (argv.dep?.length === 0) { return undefined; }
    return {
      deps: argv.dep,
    };
  }
}

main().catch((e: Error) => {
  console.error(e.stack);
  process.exit(1);
});


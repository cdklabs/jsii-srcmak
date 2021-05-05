import * as yargs from 'yargs';
import { srcmak } from './srcmak';

async function main() {
  const args = yargs
    .usage('$0 SRCDIR [OPTIONS]')
    .option('entrypoint', { desc: 'typescript entrypoint (relative to SRCDIR)', default: 'index.ts' })
    .option('dep', { desc: 'node module directories to include in compilation', type: 'array', string: true })
    .option('jsii-path', { desc: 'write .jsii output to this path', type: 'string' })
    .option('python-outdir', { desc: 'python output directory (requires --python-module-name)', type: 'string' })
    .option('python-module-name', { desc: 'python module name', type: 'string' })
    .option('java-outdir', { desc: 'java output directory (requires --java-package)', type: 'string' })
    .option('java-package', { desc: 'the java package (namespace) to use for all generated types', type: 'string' })
    .option('csharp-outdir', { desc: 'C# output directory (requires --csharp-namespace)', type: 'string' })
    .option('csharp-namespace', { desc: 'the C# namespace to use for all generated types', type: 'string' })
    .showHelpOnFail(true)
    .help();

  const argv = args.argv;

  if (argv._.length !== 1) {
    args.showHelp();
    console.error();
    console.error('Invalid number of arguments. expecting a single positional argument.');
    process.exit(1);
  }

  const srcdir = argv._[0] as string;
  await srcmak(srcdir, {
    entrypoint: argv.entrypoint,
    ...parseDepOption(),
    ...parseJsiiOptions(),
    ...parsePythonOptions(),
    ...parseJavaOptions(),
    ...parseCSharpOptions(),
  });

  function parseJsiiOptions() {
    const jsiiPath = argv['jsii-path'];
    if (!jsiiPath) { return undefined; }
    return {
      jsii: {
        path: jsiiPath,
      },
    };
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
    };
  }

  function parseJavaOptions() {
    const outdir = argv['java-outdir'];
    const packageName = argv['java-package'];
    if (!outdir && !packageName) { return undefined; }
    if (!outdir) { throw new Error('--java-outdir is required'); }
    if (!packageName) { throw new Error('--java-package is required'); }
    return {
      java: {
        outdir: outdir,
        package: packageName,
      },
    };
  }

  function parseCSharpOptions() {
    const outdir = argv['csharp-outdir'];
    const namespace = argv['csharp-namespace'];
    if (!outdir && !namespace) { return undefined; }
    if (!outdir) { throw new Error('--csharp-outdir is required'); }
    if (!namespace) { throw new Error('--csharp-namespace is required'); }
    return {
      csharp: {
        outdir: outdir,
        namespace: namespace,
      },
    };
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


import { execFileSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import { mkdtemp } from '../src/util';
import { snapshotDirectory } from './util';

const program = require.resolve('../bin/jsii-srcmak');
const srcdir = path.join(__dirname, '..', 'example');

jest.setTimeout(60_000); // 1min

test('no arguments - fails with help', () => {
  expect(() => srcmakcli()).toThrow(/Invalid number of arguments. expecting a single positional argument./);
});

test('invalid entrypoint', () => {
  expect(() => srcmakcli(srcdir)).toThrow(/unable to find typescript entrypoint/);
});

test('compile only', () => {
  srcmakcli(
    srcdir,
    '--entrypoint lib/main.ts',
  );
});

test('jsii output', async () => {
  await mkdtemp(async dir => {
    const jsiiPath = path.join(dir, 'my.jsii');

    srcmakcli(srcdir,
      '--entrypoint lib/main.ts',
      `--jsii-path ${jsiiPath}`,
    );

    expect(JSON.parse(fs.readFileSync(jsiiPath, 'utf-8'))).toMatchSnapshot();
  });
});

test('fails if only one python option is given', () => {
  expect(() => srcmakcli(srcdir,
    '--entrypoint lib/main.ts',
    '--python-module-name module',
  )).toThrow(/--python-outdir is required if --python-module-name is specified/);

  expect(() => srcmakcli(srcdir,
    '--entrypoint lib/main.ts',
    '--python-outdir dir',
  )).toThrow(/--python-module-name is required if --python-outdir is specified/);
});

test('fails if only one java option is given', () => {
  expect(() => srcmakcli(srcdir,
    '--entrypoint lib/main.ts',
    '--java-package mypackage',
  )).toThrow(/--java-outdir is required/);

  expect(() => srcmakcli(srcdir,
    '--entrypoint lib/main.ts',
    '--java-outdir dir',
  )).toThrow(/--java-package is required/);
});

test('fails if only one csharp option is given', () => {
  expect(() => srcmakcli(srcdir,
    '--entrypoint lib/main.ts',
    '--csharp-namespace mypackage',
  )).toThrow(/--csharp-outdir is required/);

  expect(() => srcmakcli(srcdir,
    '--entrypoint lib/main.ts',
    '--csharp-outdir dir',
  )).toThrow(/--csharp-namespace is required/);
});

test('python output', async () => {
  await mkdtemp(async tmpdir => {

    // put under a non-existent directory to verify it is created
    const outdir = path.join(tmpdir, 'python');

    srcmakcli(srcdir,
      '--entrypoint lib/main.ts',
      `--python-outdir ${outdir}`,
      '--python-module-name my.python.module',
    );

    expect(await snapshotDirectory(outdir, {
      excludeFiles: [ '@0.0.0.jsii.tgz' ],
    })).toMatchSnapshot();
  });
});

test('java output', async () => {
  await mkdtemp(async tmpdir => {
    // put under a non-existent directory to verify it is created
    const outdir = path.join(tmpdir, 'java');

    srcmakcli(srcdir,
      '--entrypoint lib/main.ts',
      `--java-outdir ${outdir}`,
      '--java-package mypackage',
    );

    expect(await snapshotDirectory(outdir, {
      excludeLines: [ /.*@javax.annotation.Generated.*/ ],
      excludeFiles: [ '@0.0.0.jsii.tgz' ],
    })).toMatchSnapshot();
  });
});

test('csharp output', async () => {
  await mkdtemp(async tmpdir => {
    // put under a non-existent directory to verify it is created
    const outdir = path.join(tmpdir, 'csharp');

    srcmakcli(srcdir,
      '--entrypoint lib/main.ts',
      `--csharp-outdir ${outdir}`,
      '--csharp-namespace MyPackage',
    );

    expect(await snapshotDirectory(outdir, {
      excludeFiles: [ '0.0.0.tgz' ],
    })).toMatchSnapshot();
  });
});

test('dependencies', async () => {
  await mkdtemp(async srcdir => {
    await fs.writeFile(path.join(srcdir, 'index.ts'), `
      import * as fs from 'fs';
      fs.writeFileSync('foo.bar', 'hello');
    `);

    // resolve against *this* executable
    const dep = path.dirname(require.resolve('@types/node/package.json'));
    srcmakcli(srcdir, `--dep ${dep}`);
  });
});

function srcmakcli(...args: string[]) {
  const a = args.join(' ');
  execFileSync(program, a ? a.split(' ') : []);
}
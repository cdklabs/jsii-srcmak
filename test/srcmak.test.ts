
import * as fs from 'fs-extra';
import * as path from 'path';
import { snapshotDirectory } from './util';
import { srcmak } from '../src';
import { mkdtemp } from '../src/util';

jest.setTimeout(60_000); // 1min

test('just compile', async () => {
  await mkdtemp(async source => {
    await fs.writeFile(path.join(source, 'index.ts'), `
    export interface Operands {
      readonly lhs: number;
      readonly rhs: number;
    }

    export class Hello {
      public add(ops: Operands): number {
        return ops.lhs + ops.rhs;
      }
    }
    `);

    await srcmak(source);
  });
});

test('compilation error fails and includes error message', async () => {
  await mkdtemp(async source => {
    await fs.writeFile(path.join(source, 'index.ts'), 'I DO NOT COMPUTE');

    let error;
    try { await srcmak(source); }
    catch (e) { error = e; }

    expect(error).toBeDefined();
    expect(error.message).toMatch(/Cannot find name 'COMPUTE'/);
    expect(error.message).toMatch(/Compilation errors prevented the JSII assembly/);
  });
});

test('python + different entrypoint + submodule', async () => {
  await mkdtemp(async source => {
    const entry = 'different/entry.ts';
    const ep = path.join(source, entry);
    await fs.mkdirp(path.dirname(ep));
    await fs.writeFile(ep, `
    export interface Operands {
      readonly lhs: number;
      readonly rhs: number;
    }

    export class Hello {
      public add(ops: Operands): number {
        return ops.lhs + ops.rhs;
      }
    }
    `);

    await mkdtemp(async target => {
      await srcmak(source, {
        entrypoint: 'different/entry.ts',
        moduleKey: 'python.package',
        python: {
          outdir: target,
          moduleName: 'my_python_module.submodule',
        },
      });

      const dir = await snapshotDirectory(target, {
        excludeFiles: [ '@0.0.0.jsii.tgz' ],
      });
      expect(dir).toMatchSnapshot();
    });
  });
});

test('java + different entrypoint', async () => {
  await mkdtemp(async source => {
    const entry = 'different/entry.ts';
    const ep = path.join(source, entry);
    await fs.mkdirp(path.dirname(ep));
    await fs.writeFile(ep, `
    export interface Operands {
      readonly lhs: number;
      readonly rhs: number;
    }

    export class Hello {
      public add(ops: Operands): number {
        return ops.lhs + ops.rhs;
      }
    }
    `);

    await mkdtemp(async target => {
      await srcmak(source, {
        entrypoint: 'different/entry.ts',
        moduleKey: 'java.package',
        java: {
          outdir: target,
          package: 'hello.world',
        },
      });

      const dir = await snapshotDirectory(target, {
        excludeLines: [ /.*@javax.annotation.Generated.*/ ],
        excludeFiles: [ '@0.0.0.jsii.tgz' ],
      });
      expect(dir).toMatchSnapshot();
    });
  });
});

test('csharp + different entrypoint', async () => {
  await mkdtemp(async source => {
    const entry = 'different/entry.ts';
    const ep = path.join(source, entry);
    await fs.mkdirp(path.dirname(ep));
    await fs.writeFile(ep, `
    export interface Operands {
      readonly lhs: number;
      readonly rhs: number;
    }

    export class Hello {
      public add(ops: Operands): number {
        return ops.lhs + ops.rhs;
      }
    }
    `);

    await mkdtemp(async target => {
      await srcmak(source, {
        entrypoint: 'different/entry.ts',
        moduleKey: 'csharp.package',
        csharp: {
          outdir: target,
          namespace: 'Hello.World',
        },
      });

      const dir = await snapshotDirectory(target, {
        excludeFiles: [ '@0.0.0.jsii.tgz' ],
      });
      expect(dir).toMatchSnapshot();
    });
  });
});

test('deps: compile against a local jsii dependency', async () => {
  await mkdtemp(async source => {
    await fs.writeFile(path.join(source, 'index.ts'), `
    import { Construct } from 'constructs';

    export class Hello extends Construct {
      public add(lhs: number, rhs: number): number {
        return lhs + rhs;
      }
    }
    `);

    await srcmak(source, {
      deps: [
        path.dirname(require.resolve('constructs/package.json')), // <<---- this is the magic
      ],
    });
  });
});

test('outputJsii can be used to look at the jsii file', async () => {
  await mkdtemp(async source => {
    await fs.writeFile(path.join(source, 'index.ts'), `
    export class Foo {
      public static hello() { return "world"; }
    }
    `);

    await mkdtemp(async target => {
      const outputPath = path.join(target, '.jsii');
      await srcmak(source, { jsii: { path: outputPath } });
      expect(await fs.readJson(outputPath)).toMatchSnapshot();
    });
  })
});

test('java with invalid package', async () => {
  await expect(srcmak('.', {
    entrypoint: 'different/entry.ts',
    moduleKey: 'java.package',
    java: {
      outdir: '.',
      package: 'hello-world',
    },
  })).rejects.toEqual(new Error('Java package [hello-world] may not contain "-"'));
});

test('python with invalid module name', async () => {
  await expect(srcmak('.', {
    entrypoint: 'different/entry.ts',
    moduleKey: 'python.package',
    python: {
      outdir: '.',
      moduleName: 'my-python.submodule',
    },
  })).rejects.toEqual(new Error('Python moduleName [my-python.submodule] may not contain "-"'));
});

test('csharp with invalid namespace', async () => {
  await expect(srcmak('.', {
    entrypoint: 'different/entry.ts',
    moduleKey: 'csharp.package',
    csharp: {
      outdir: '.',
      namespace: 'hello-world',
    },
  })).rejects.toEqual(new Error('C# namespace [hello-world] may not contain "-"'));
});
import { withTempDir } from '../lib/util'
import * as fs from 'fs-extra';
import * as path from 'path';
import { snapshotDirectory } from './util';
import { srcmak } from '../lib';

jest.setTimeout(60_000); // 1min

test('just compile', async () => {
  await withTempDir('source', async source => {
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

    await withTempDir('target', async target => {
      await srcmak(source, target, { modules: [] });
    });
  });
});

test('compilation error fails and includes error message', async () => {
  await withTempDir('source', async source => {
    await fs.writeFile(path.join(source, 'index.ts'), 'I DO NOT COMPUTE');

    await withTempDir('target', async target => {
      let error;
      try { await srcmak(source, target, { modules: [] }); }
      catch (e) { error = e; }

      expect(error).toBeDefined();
      expect(error.message).toMatch(/Cannot find name 'COMPUTE'/);
      expect(error.message).toMatch(/Compilation errors prevented the JSII assembly/);
    });
  });
});

test('python + different entrypoint + submodule', async () => {
  await withTempDir('source', async source => {
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

    await withTempDir('target', async target => {
      await srcmak(source, target, {
        entrypoint: 'different/entry.ts',
        pythonName: 'my_python_module.submodule',
        modules: [],
      });

      const dir = await snapshotDirectory(target, [ 'generated@0.0.0.jsii.tgz' ]);
      expect(dir).toMatchSnapshot();
    });
  });
});

test('compile against a local jsii dependency', async () => {
  await withTempDir('source', async source => {
    await fs.writeFile(path.join(source, 'index.ts'), `
    import { Construct } from 'constructs';

    export class Hello extends Construct {
      public add(lhs: number, rhs: number): number {
        return lhs + rhs;
      }
    }
    `);

    await withTempDir('target', async target => {
      await srcmak(source, target, {
        modules: [
          'constructs', // <<---- this is the magic
        ],
      });
    });
  });
});

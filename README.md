# jsii-srcmak

> Generates jsii source files for multiple languages from TypeScript.

## Usage

Say I have a TypeScript file `source/index.ts`:

```ts
export interface Operands {
  readonly lhs: number;
  readonly rhs: number;
}

export class Calc {
  public add(ops: Operands): number {
    return ops.lhs + ops.rhs;
  }

  public mul(ops: Operands): number {
    return ops.lhs * opts.rhs;
  }
}
```

The following invocation will generate `target/my_python_module` with `Calc` in python:

```ts
import { srcmak } from 'jsii-srcmak';

await srcmak('source', 'target', {
  pythonName: 'my_python_module'
});
```

## License

Distributed under the [Apache 2.0](./LICENSE) license.
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { spawn, SpawnOptions } from 'child_process';

export async function mkdtemp(closure: (dir: string) => Promise<void>) {
  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), 'temp-'));
  try {
    await closure(workdir);

    if (!process.env.RETAIN_TMP) {
      await fs.remove(workdir);
    } else {
      console.error(`NOTE: Temp directory retained (RETAIN_TMP=1): ${workdir}`);
    }
  } catch(e) {
    console.error(`NOTE: Temp directory retained due to an error: ${workdir}`);
    throw e;
  }
}

export async function exec(moduleName: string, args: string[] = [], options: SpawnOptions = { }) {
  return new Promise((ok, fail) => {

    const opts: SpawnOptions = {
      ...options,
      stdio: [ 'inherit', 'pipe', 'pipe' ],
    };
    const child = spawn(process.execPath, [ moduleName, ...args ], opts);

    const data = new Array<Buffer>();
    child.stdout?.on('data', chunk => data.push(chunk));
    child.stderr?.on('data', chunk => data.push(chunk));

    const newError = (message: string) => new Error([
      message,
      '  | ' + Buffer.concat(data).toString('utf-8').split('\n').filter(x => x).join('\n  | '),
      '  +----------------------------------------------------------------------------------',
      `  | Command: ${moduleName} ${args.join(' ')}`,
      `  | Workdir: ${path.resolve(options.cwd ?? '.')}`,
      '  +----------------------------------------------------------------------------------',
    ].join('\n'));

    child.once('error', err => {
      throw newError(`jsii compilation failed. error: ${err.message}`);
    });

    child.once('exit', code => {
      if (code === 0) {
        return ok();
      }
      else {
        return fail(newError(`jsii compilation failed with non-zero exit code: ${code}`));
      }
    });
  });
}

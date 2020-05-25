import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { spawn, SpawnOptions } from 'child_process';

export async function withTempDir(dirname: string, closure: (dir: string) => Promise<void>) {
  const prevdir = process.cwd();
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'cdk8s.'));
  const workdir = path.join(parent, dirname);
  await fs.mkdirp(workdir);
  try {
    process.chdir(workdir);
    await closure(workdir);

    if (!process.env.WITH_TEMP_DIR_RETAIN) {
      await fs.remove(parent);
    } else {
      console.error(`retained temp dir: ${parent}`);
    }
  } catch(e) {
    console.error(`retained temp dir due to an error: ${parent}`);
    throw e;
  } finally {
    process.chdir(prevdir);
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
      `COMMAND: ${moduleName} ${args.join(' ')}`,
      `WORKDIR: ${path.resolve(options.cwd ?? '.')}`,
      '------------------------------------------------------------------------------------',
      Buffer.concat(data).toString('utf-8'),
      '------------------------------------------------------------------------------------',
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

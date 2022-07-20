import { readdir } from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { dirname, join } from 'path';
import { promisify } from 'util';
import { pipeline, Transform, Writable } from 'stream';
import StreamConcat from 'stream-concat';

// transformando callbacks em promises
const pipelineAsync = promisify(pipeline);

const { pathname: currentFile } = new URL(import.meta.url);
const cwd = dirname(currentFile);
const filesDir = `${cwd}/data-tmp`;
const output = './data/db-plants.json';
const filesDirEach = `${cwd}/data-tmp2`;

// setInterval(() => process.stdout.write('.'), 10).unref();

const files = await readdir(filesDir)

const streams = files.map(file => createReadStream(join(filesDirEach, file)));
const combinedStreams = new StreamConcat(streams);

//const combinedStreams = createReadStream(join(filesDirEach, files[0]));

async function each(){
  try {
    for await (const file of files){
      
      const read = createReadStream(join(filesDir, file));
      const write = createWriteStream(join(filesDirEach, file))

      read.on('data', function(chunk) {
        write.write(`"-,${Math.floor(Math.random()* 1000)}": ${chunk}`)
      })
    };
  } catch (error) {
    console.log(error);
  }
}
await each();

const finalStream = createWriteStream(output);

await pipelineAsync(
  combinedStreams,
  finalStream
)
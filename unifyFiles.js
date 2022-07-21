import { readdir } from 'fs/promises';
import { createReadStream, createWriteStream, appendFileSync, unlinkSync, rmSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { pipeline, Transform } from 'stream';
import StreamConcat from 'stream-concat';

// setInterval(() => process.stdout.write('.'), 10).unref();
// cwd = Current work directory
export const unifyFiles = async (cwd) => {

  // transformando callbacks em promises
  const pipelineAsync = promisify(pipeline);

  const filesDir = `${cwd}/data-tmp`;
  const output = `${cwd}/data/db-plants.txt`;
  const filesDirEach = `${cwd}/data-tmp2`;

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
      console.log('erro', error);
    }
  }
  await each();

  const finalStream = createWriteStream(output);

  await pipelineAsync(
    combinedStreams,
    finalStream
  )
  
  const finalRead = createReadStream(join(`${cwd}/data`,'db-plants.txt'));
  const transformStream = new Transform({
    transform(chunk, encoding, cb){
      this.counter = this.counter ?? 0;
      const data = chunk.toString();
      const firstFormatted = data.replace(/"-,/g, `,"`);

      if(this.counter === 0) {
        const secondFormatted = firstFormatted.replace(/,/, '{');
        this.counter += 1;
        return cb(null, secondFormatted)
      }

      return cb(null,firstFormatted);
    }
  });
  const finalWrite = createWriteStream(join(`${cwd}/data`,'db-plants.json'));
  await pipelineAsync(
    finalRead,
    transformStream,
    finalWrite
  );
  appendFileSync(join(`${cwd}/data`,'db-plants.json'), '}');
  unlinkSync(join(`${cwd}/data`,'db-plants.txt'));
  // rmSync(join(`${cwd}/data-tmp`),{force: true, recursive: true});
  // rmSync(join(`${cwd}/data-tmp2`),{force: true, recursive: true});
}

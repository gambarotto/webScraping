import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { getAllPages } from './crawlerData.js';
import { unifyFiles } from './unifyFiles.js';

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'y', 'z']

const { pathname: currentFile } = new URL(import.meta.url);
const cwd = dirname(currentFile);

const tmp = `${cwd}/data-tmp`;
const tmp2 = `${cwd}/data-tmp2`;

if (!existsSync(tmp)){
    mkdirSync(tmp);
}
if (!existsSync(tmp2)){
    mkdirSync(tmp2);
}
const start = async () => {
  await getAllPages(0,alphabet.length, alphabet);
  await unifyFiles(cwd);
}
start();
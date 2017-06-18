"use strict";
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Defer from '../libs/defer';
import rimraf from 'rimraf';

const id = Math.random();

const getIndex = (() => {
  let index = 0;
  return () => `${id}-${index++}`;
})();

export const mkPromise = fn => (...args) => new Promise((resolve, reject) => {
  fn(...args, (error, res) => error ? reject(error) : resolve(res));
});

export const mkDelay = (fn, durition = 1000) => (...args) => {
  const defer = new Defer();
  setTimeout(() => fn(...args).then(defer.resolve), durition);
  return defer.promise;
};

export const buildUtils = async () => {

  const dataDir = path.join(__dirname, 'data', getIndex().toString());

  await mkPromise(rimraf)(dataDir);
  await mkPromise(mkdirp)(dataDir);

  const deleteFile = async filePath => {
    await mkPromise(::fs.unlink)(filePath);
  };
  const createFile = async (filePath, content) => {
    const writable = fs.createWriteStream(filePath);
    await mkPromise(::writable.write)(content, 'utf8');
  };

  const setContent = (filePath, content) => {
    return mkPromise(::fs.writeFile)(filePath, content, 'utf8');
  };

  return {
    dataDir,
    getFilename: name => {
      return path.isAbsolute(name) ? name : path.join(dataDir, name);
    },
    createFile: (filePath, content) => {
      return mkDelay(createFile)(filePath, content);
    },
    setFileContent: async (filePath, content) => {
      return mkDelay(setContent)(filePath, content);
    },
    deleteFile: filePath => {
      return mkDelay(deleteFile)(filePath);
    }
  };
};

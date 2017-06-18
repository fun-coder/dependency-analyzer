"use strict";
import test from 'ava';
import { buildDM } from '../index';
import glob from 'glob';
import { buildUtils, mkPromise } from './test-utils';

let dm, applicationFile, dependencyFile, createFile, dataDir, deleteFile, getFilename;

test.before(async () => {
  const utils = await buildUtils();
  createFile = utils.createFile;
  deleteFile = utils.deleteFile;
  getFilename = utils.getFilename;
  dataDir = utils.dataDir;

  applicationFile = getFilename('application.js');
  dependencyFile = getFilename('dependency.js');

  await createFile(dependencyFile, `
    "use strict";
    export const value = 'Hello World';
  `);

  await createFile(applicationFile, `
    "use strict";
    import Promise from 'bluebird';
    import { value } from './dependency';
    Promise.resolve(() => console.log('value is', value));
  `);

  dm = await buildDM(dataDir);
});

test.after(async () => {
  await deleteFile(applicationFile);
  await deleteFile(dependencyFile);
});

test('DM should have two nodes', async t => {
  const files = await mkPromise(glob)(`${dataDir}/**/*.js`);
  t.is(dm.nodes.length, files.length);
});

test('DM should find node by path', t => {
  const applicationNode = dm.find(applicationFile);
  t.not(applicationNode, undefined);
});

test('Node should return imports when get imports from node', t => {
  const dependencyNode = dm.find(dependencyFile);
  t.deepEqual([applicationFile], dependencyNode.imports);
});

test('Node should return dependencies when get deps from node', t => {
  const runNode = dm.find(applicationFile);
  t.deepEqual(['bluebird', dependencyFile], runNode.dependencies);
});

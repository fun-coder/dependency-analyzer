"use strict";
import test from 'ava';
import { buildDM } from '../index';
import { buildUtils } from './test-utils';
import Defer from '../libs/defer';

test('DM should emit add event when create new file', async t => {
  const utils = await buildUtils();
  const dm = await buildDM(utils.dataDir);
  const applicationFile = utils.getFilename('events-add.js');
  const defer = new Defer();

  dm.on('add', path => {
    t.is(path, applicationFile);
    defer.resolve();
  });

  utils.createFile(applicationFile, `
    console.log('Hello');
  `);

  return defer.promise;
});

test('DM should emit change event when edit file', async t => {
  const utils = await buildUtils();
  const dm = await buildDM(utils.dataDir);
  const applicationFile = utils.getFilename('events-change.js');
  const defer = new Defer();

  await utils.createFile(applicationFile, `
    "use strict";
    export const value = 'Hello World';  
  `);

  dm.on('change', path => {
    t.is(path, applicationFile);
    defer.resolve();
  });

  await utils.setFileContent(applicationFile, `
    console.log('Hello');
  `);

  return defer.promise;
});

test('DM should emit unlink event when delete file', async t => {
  const utils = await buildUtils();
  const dm = await buildDM(utils.dataDir);
  const applicationFile = utils.getFilename('events-unlink.js');
  const defer = new Defer();

  dm.on('unlink', path => {
    t.is(path, applicationFile);
    defer.resolve();
  });

  await utils.createFile(applicationFile, `
    console.log('Hello');
  `);

  await utils.deleteFile(applicationFile);

  return defer.promise;
});



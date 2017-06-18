"use strict";

import DM from './libs/dm';

export const buildDM = async dir => {
  const dm = new DM(dir);
  await dm.ready();
  return dm;
};
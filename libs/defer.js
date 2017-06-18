"use strict";
import Promise from 'bluebird';

export default class {
  constructor() {
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}
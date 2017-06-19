"use strict";

import glob from 'glob';
import Defer from './defer';
import Node from './node';
import chokidar from 'chokidar';

const getAllFiles = dir => {
  const defer = new Defer();
  glob(`${dir}/**/*.js`, (error, files) => error ? defer.reject(error) : defer.resolve(files));
  return defer.promise;
};

export default class DM {

  store = {};
  watcher;
  dir;
  listeners = {};

  constructor(dir) {
    this.dir = dir;
    this.watcher = chokidar.watch(dir, { ignored: /^\./, persistent: true });
  }

  async ready() {
    await this.initNodes();
    await this.watchReady();
    this.initWatch();
    return this;
  }

  watchReady() {
    const defer = new Defer();
    this.watcher.on('ready', defer.resolve);
    return defer.promise;
  }

  async initNodes() {
    const files = await getAllFiles(this.dir);
    files.forEach(file => this.store[file] = new Node(file, this));
    await Promise.all(this.nodes.map(node => node.buildDependency()));
    this.nodes.forEach(node => node.buildImports());
  }

  initWatch() {
    this.watcher.on('add', path => this.add(path));
    this.watcher.on('change', path => this.change(path));
    this.watcher.on('unlink', path => this.delete(path));
  }

  // public method -->

  on(eventName, listener) {
    if (!this.listeners[eventName]) this.listeners[eventName] = [];
    this.listeners[eventName].push(listener);
  }

  find(path) {
    return this.store[path];
  }

  // <-- public method

  async change(path) {
    await this.notify('change', path);
    this.store[path].buildDependency();
  }

  async add(path) {
    if (this.store[path]) return;
    const node = new Node(path, this);
    await node.buildDependency();
    node.buildImports();
    this.store[path] = node;
    await this.notify('add', path);
  }

  async delete(path) {
    await this.notify('unlink', path);
    delete this.store[path];
    this.nodes.forEach(node => {
      const index = node.imports.indexOf(path);
      if (index !== -1) node.imports.splice(index, 1);
    });
  }

  get nodes() {
    return Object.values(this.store);
  }

  getImports(moduleId) {
    return this.nodes
      .filter(node => node.dependencies.indexOf(moduleId) !== -1)
      .map(node => node.path);
  }

  async notify(event, path) {
    const listeners = this.listeners[event];
    if (listeners instanceof Array) await Promise.all(listeners.map(listener => listener(path)));
  }
}




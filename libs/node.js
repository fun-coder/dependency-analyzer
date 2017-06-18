"use strict";
import precinct from 'precinct';
import path from 'path';
import fs from './fs';
import { hasExtension } from './file-utils';

export default class {
  imports = [];
  dependencies = [];
  path;
  dm;
  dir;
  extension;

  constructor(filePath, dm) {
    this.path = filePath;
    this.dm = dm;
    this.dir = path.dirname(filePath);
    this.extension = path.extname(filePath);
  }

  async buildDependency() {
    this.dependencies.push(...await this.getDependencies());
  }

  buildImports() {
    this.imports.push(...this.dm.getImports(this.path));
  }

  async getDependencies() {
    const content = await fs.readFileAsync(this.path, 'utf8');
    return precinct(content).map(dep => /^\./.test(dep) ? this.completePath(dep) : dep);
  }

  completePath(partialPath) {
    const fileName = path.join(this.dir, partialPath);
    return hasExtension(fileName) ? fileName : `${fileName}${this.extension}`;
  }
}
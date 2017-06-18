"use strict";

const fileExtensions = [
  'js', 'jsx', 'es', 'es6', // Javascript extensions
  'css', 'sass', 'scss', // Style extensions
  'jpg', 'jpeg', 'png', // Image extensions
  'svg' // Font extensions
];

export const hasExtension = fileName => {
  const matched = /\.(.*?)$/.exec(fileName);
  if (!matched) return false;
  const extname = matched[matched.index];
  return fileExtensions.indexOf(extname) !== -1;
};
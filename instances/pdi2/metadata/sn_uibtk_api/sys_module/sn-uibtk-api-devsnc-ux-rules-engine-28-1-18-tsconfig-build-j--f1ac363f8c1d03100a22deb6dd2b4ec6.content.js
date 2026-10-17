
      'use strict';

var __global$ = globalThis || (typeof window !== "undefined" ? window : self);
Object.defineProperty(exports, '__esModule', {
  value: true
});
var compilerOptions = {
  emitDeclarationOnly: true
};
var exclude = ["**/__tests__/**"];
var tsconfig_build = {
  compilerOptions: compilerOptions,
  "extends": "./tsconfig.json",
  exclude: exclude
};
exports.compilerOptions = compilerOptions;
exports["default"] = tsconfig_build;
exports.exclude = exclude;

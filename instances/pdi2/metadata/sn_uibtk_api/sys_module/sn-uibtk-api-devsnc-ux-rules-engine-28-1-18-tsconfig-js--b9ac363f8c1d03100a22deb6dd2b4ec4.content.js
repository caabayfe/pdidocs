
      'use strict';

var __global$ = globalThis || (typeof window !== "undefined" ? window : self);
Object.defineProperty(exports, '__esModule', {
  value: true
});
var compilerOptions = {
  outDir: "dist/types",
  rootDir: "src",
  allowJs: true,
  strict: true,
  declaration: true,
  declarationMap: true,
  sourceMap: true,
  esModuleInterop: true
};
var include = ["./src/**/*"];
var tsconfig = {
  compilerOptions: compilerOptions,
  include: include
};
exports.compilerOptions = compilerOptions;
exports["default"] = tsconfig;
exports.include = include;

const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const lintPlugin = require("./plugins/lint-code-plugin");
const fs = require("fs");
const path = require("path");

const sourceCode = `
    let name: string;
    name = 111;
`

const ast = parser.parse(sourceCode, {
    sourceType: "unambiguous",
    plugins: ['typescript']
});

const { code } = transformFromAstSync(ast, sourceCode, {
    plugins: [[lintPlugin, {
        fix: true
    }]],
});

console.log(code);

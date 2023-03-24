const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const autoTrackPlugin = require("./plugins/auto-track-plugin");
const path = require("path");
const fs = require("fs");

const sourceCode = fs.readFileSync(path.join(__dirname, "./source.js"), {
    encoding: "utf-8",
});

const ast = parser.parse(sourceCode, {
    sourceType: "unambiguous",
});

const { code } = transformFromAstSync(ast, sourceCode, {
    plugins: [[autoTrackPlugin, {
        trackerPath: 'tracker'
    }]]
});

console.log(code);



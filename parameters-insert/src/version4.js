const { transformFileSync } = require("@babel/core");
const { codeFrameColumns } = require("@babel/code-frame");
const insertParametersPlugin = require("./plugin/parameters-insert-plugin");
const path = require("path");

const { code } = transformFileSync(path.join(__dirname, "./sourceCode.js"), {
    plugins: [insertParametersPlugin],
    parserOpts: {
        sourceType: "unambiguous",
        plugins: ["jsx"],
    },
});

console.log(code);

const res = codeFrameColumns(
    code,
    {
        start: { line: 1, column: 1 },
        end: { line: 2, column: 1 },
    },
    {
        highlightCode: true,
        message: "出错了",
    }
);

console.log(res);

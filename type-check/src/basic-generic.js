const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const lintPlugin = require("./plugins/basic-generic-plugin");

const sourceCode = `
    function sum<T>(a: T, b: T): T {
        return a + b;
    }
    sum<number>(1, '2')
`;

const ast = parser.parse(sourceCode, {
    sourceType: "unambiguous",
    plugins: ["typescript"],
});

const { code } = transformFromAstSync(ast, sourceCode, {
    plugins: [
        [
            lintPlugin,
            {
                fix: true,
            },
        ],
    ],
});

console.log(code);

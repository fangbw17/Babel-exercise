const babel = require("@babel/core");
const parser = require("@babel/parser");

// 简单的 访问者流程
// Babel 的主流程是 源码 -> AST -> transform -> generater
// 自定义的插件中必须有一个 visitor 的属性，
// 因为 babel 自定义插件的实现是基于 访问者 的设计模式实现的
// 插件大多都是作用于 transform 这个阶段中的

// 自定义插件
const simplePlugin = function (api, options, dirname, ...args) {
    console.log("自定义 babel 插件");
    return {
        pre(file) {
            console.log("pre");
        },
        visitor: {
            "File|Program|VariableDeclaration|Identifier|StringLiteral|FunctionExpression|BlockStatement":
                {
                    enter(path, state) {
                        console.log(
                            "enter ------------ ",
                            path.type,
                            path.node.name
                        );
                    },
                    exit(path, state) {
                        console.log(
                            "exit +++++++++++++ ",
                            path.type,
                            path.node.name
                        );
                    },
                },
        },
        post(file) {
            console.log("post");
        },
    };
};

const sourceCode = `const text = 'hello, world!'
const a = function() {}`;

const ast = parser.parse(sourceCode, {
    sourceType: "unambiguous",
});

const { code } = babel.transformFromAstSync(ast, sourceCode, {
    plugins: [[simplePlugin, { sd: "text" }]],
});

// console.log(ast);

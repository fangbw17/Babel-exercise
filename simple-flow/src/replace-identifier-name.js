const babel = require("@babel/core");
const parser = require("@babel/parser");
const template = require('@babel/template').default
const t = require('@babel/types')
const generate = require('@babel/generator').default

const replaceIdentifierNamePlugin = function (api, options, dirnae) {
    return {
        pre(file) {},
        visitor: {
            FunctionDeclaration(path, state) {
                const param = path.node.params[0] 
                const paramName = param.name;
                param.name = options.name;
                path.traverse(
                    {
                        Identifier(curPath, curState) {
                            if (curPath.node.name === this.paramName) {
                                curPath.node.name = options.name;
                            }
                        },
                    },
                    {
                        paramName,
                    }
                );
            },
        },
        post(file) {},
    };
};

// 源代码
const sourceCode = `
    function squre(n) {
        return n * n
    }
`;

// 将源码解析成 AST
const ast = parser.parse(sourceCode, {
    // 根据语法自动判断是 es 还是 cmj
    sourceType: "unambiguous",
});

const { code } = babel.transformFromAstSync(ast, sourceCode, {
    plugins: [
        [
            replaceIdentifierNamePlugin,
            {
                name: "x",
            },
        ],
    ],
});

console.log(code);



{
    const buildRequire = template(`var IMPORT_NAME = require(SOURCE)`)
    console.log(buildRequire);

    const ast = buildRequire({
        IMPORT_NAME: t.identifier("myModule"),
        SOURCE: t.stringLiteral('my-module')
    })

    console.log(generate(ast).code);


    const sourceCode = `left === right`
    const codeAst = parser.parse(sourceCode, {
        sourceType: 'unambiguous'
    })

    const {code} = babel.transformFromAstSync(codeAst, sourceCode, {
        plugins: [
            function(api, options, dirname) {
                return {
                    visitor: {
                        BinaryExpression(path) {
                            // console.log(path.get('left'));
                            // console.log(path.node.left);

                            const res =  path.findParent((path) => path.isProgram())
                            console.log(res.node.type);
                        }
                    }
                }
            }
        ]
    })
    console.log("结果");
    console.log(code);
}

const {transformFromAstSync} = require('@babel/core')
const parser = require('@babel/parser')
const seniorGenericPlugin = require('./plugins/senior-generic-plugin')

const sourceCode = `
    type Res<Param> = Param extends 1 ? number : string
    function add<T>(a: T, b: T): T {
        return a + b
    }
    add<Res<2>>(1, '2')
`
const ast = parser.parse(sourceCode, {
    sourceType: 'unambiguous',
    plugins: ["typescript"],
})

console.log(ast);

const {code} = transformFromAstSync(ast, sourceCode, {
    plugins: [[seniorGenericPlugin]]
})

console.log(code);
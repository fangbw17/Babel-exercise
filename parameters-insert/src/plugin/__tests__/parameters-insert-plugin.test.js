const pluginTester = require('babel-plugin-tester')
const insertPlugin = require('../parameters-insert-plugin')


pluginTester({
    plugin: insertPlugin,
    babelOptions: {
        parserOpts: {
            sourceType: "unambiguous",
            plugins: ["jsx"],
        },
    },
    tests: {
        "console.xx前插入了CallExpression的AST": {
            code: `
                console.log(1);

                function func() {
                    console.log(2);
                }

                export default class Clazz {
                    say() {
                        console.debug(3);
                    }
                    render() {
                        return <div>{console.error(4)}</div>
                    }
                }
            `,
            snapshot: true,
        },
    },
});

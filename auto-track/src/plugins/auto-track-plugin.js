const { declare } = require("@babel/helper-plugin-utils");
const importModule = require("@babel/helper-module-imports");

// declare 包一层 plugin。兼容 assertVersion
const autoTrackPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        visitor: {
            Program: {
                // 节点前处理
                enter(path, state) {
                    // 当前路径遍历
                    path.traverse({
                        // 是否有 Import 声明
                        ImportDeclaration(curPath) {
                            // 获取当前声明的值
                            const requirePath =
                                curPath.get("source").node.value;
                            // 判断和外部的名称是否相同
                            if (requirePath === options.trackerPath) {
                                // 获取 path
                                const specifierPath =
                                    curPath.get("specifiers.0");
                                // es6 的导入方式
                                if (
                                    specifierPath.isImportSpecifier() ||
                                    specifierPath.isImportDefaultSpecifier()
                                ) {
                                    // 直接赋值
                                    state.trackerImportId =
                                        specifierPath.toString();
                                } else if (
                                    specifierPath.isImportNamespaceSpecifier()
                                ) {
                                    // 命名空间 导入
                                    state.trackerImportId = specifierPath
                                        .get("local")
                                        .toString();
                                }
                                // path.stop();
                            }
                        },
                    });
                    // 如果没有导入目标 模块，则生成一个
                    if (!state.trackerImportId) {
                        state.trackerImportId = importModule.addDefault(
                            path,
                            "tracker",
                            {
                                nameHint: path.scope.generateUid("tracker"),
                            }
                        ).name;
                    }
                    // 如果不存在 AST，则生成
                    if (!state.trackerAST) {
                        state.trackerAST = api.template.statement(
                            `${state.trackerImportId}()`
                        )();
                    }
                },
            },
            "ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration"(
                path,
                state
            ) {
                // 遍历各种 块级作用域（函数、方法、箭头函数）
                const bodyPath = path.get("body");
                if (bodyPath.isBlockStatement()) {
                    // 如果有代码块，则插入到最前面
                    bodyPath.node.body.unshift(state.trackerAST);
                } else {
                    // 没有代码块，包一层替换
                    const ast = api.template.statement(
                        `{${state.trackerImportId}();return PREV_BODY;}`
                    )({ PREV_BODY: bodyPath.node });
                    bodyPath.replaceWith(ast);
                }
            },
        },
    };
});
module.exports = autoTrackPlugin;

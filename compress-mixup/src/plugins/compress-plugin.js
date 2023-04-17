const { declare } = require("@babel/helper-plugin-utils");

const compressPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        pre(file) {},
        visitor: {
            BlockStatement(path, state) {
                // 获取 block 结构中的 body 内容
                const statementPaths = path.get("body");
                // 设置标识
                let purge = false;
                // 遍历
                for (let i = 0; i < statementPaths.length; i++) {
                    const nodePath = statementPaths[i]
                    // 如果是 return 语句，将标识设置为 true，并跳过本次循环
                    if (nodePath.isReturnStatement()) {
                        purge = true;
                        continue;
                    }

                    if (purge && !canExistAfterCompletion(nodePath)) {
                        // 移除不会执行的语句
                        nodePath.remove()
                    }
                }
            },
            Scopable(path) {
                Object.entries(path.scope.bindings).forEach(([key, binding]) => {
                    // 未被引用
                    if (!binding.referenced) {
                        // 声明的变量是否调用了函数： const a = b()
                        if (binding.path.get('init').isCallExpression()) {
                            // 拿到节点前的注释
                            const comments = binding.path.get('init').node.leadingComments;
                            if (comments && comments[0]) {
                                // 无副作用标识
                                if (comments[0].value.includes('PURE')) {
                                    binding.path.remove()
                                    return
                                }
                            }
                        }
                        // 如果是纯无副作用，直接删除，否则替换为调用函数 b()
                        if (!path.scope.isPure(binding.path.node.init)) {
                            if (binding.path.node.init) {
                                binding.path.parentPath.replaceWith(api.types.expressionStatement(binding.path.node.init))
                            }
                        } else {
                            binding.path.remove()
                        }
                    }
                })
            }
        },
        post(file) {},
    };
});

// 变量提升与函数提升
function canExistAfterCompletion(nodePath) {
    return nodePath.isFunctionDeclaration() || nodePath.isVariableDeclaration({
        kind: "var"
    })
}

module.exports = compressPlugin;

const { declare } = require("@babel/helper-plugin-utils");

const lintPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        pre(file) {
            file.set("errors", []);
        },
        visitor: {
            // for 循环检查
            ForStatement(path, state) {
                const errors = state.file.get("errors");
                // 获取 for 中的判断运算符
                const testOperator = path.node.test.operator;
                const updateOperator = path.node.update.operator;

                let ssholdUpdateOperator;
                // 小于
                if (["<", "<="].includes(testOperator)) {
                    ssholdUpdateOperator = "++";
                } else if ([">", ">="].includes[testOperator]) {
                    ssholdUpdateOperator = "--";
                }
                if (ssholdUpdateOperator !== updateOperator) {
                    // 报错： 遍历条件方向错误
                    const tmp = Error.stackTraceLimit;
                    Error.stackTraceLimit = 0;
                    const error = path
                        .get("update")
                        .buildCodeFrameError("for direction error", Error);
                    errors.push(error);
                    Error.stackTraceLimit = tmp;
                }
            },
            // 函数不可重新赋值
            AssignmentExpression(path, state) {
                const errors = state.file.get("errors");

                // 获取表达式左侧值
                const assignTarget = path.get("left").toString();
                // 在作用域中查找绑定的对应节点
                const bind = path.scope.getBinding(assignTarget);
                if (bind) {
                    // 节点是否是函数声明或者函数表达式
                    if (
                        bind.path.isFunctionDeclaration() ||
                        bind.path.isFunctionExpression()
                    ) {
                        const tmp = Error.stackTraceLimit;
                        Error.stackTraceLimit = 0;
                        const error = path.buildCodeFrameError(
                            "can not reassign to function",
                            Error
                        );
                        errors.push(error);
                        Error.stackTraceLimit = tmp;
                    }
                }
            },
            BinaryExpression(path, state) {
                const errors = state.file.get("errors");
                if (["!=", "=="].includes(path.node.operator)) {
                    const left = path.get("left");
                    const right = path.get("right");
                    // 都是字面量且值类型一样
                    if (
                        !(left.isLiteral() && right.isLiteral() &&
                        typeof left.node.value === typeof right.node.value)
                    ) {
                        const tmp = Error.stackTraceLimit;
                        Error.stackTraceLimit = 0;
                        const error = path.buildCodeFrameError(
                            `please replace ${path.node.operator} with ${path.node.operator + '='}`,
                            Error
                        );
                        errors.push(error);
                        Error.stackTraceLimit = tmp;
                        // 自动修复
                        if (state.opts.fix) {
                            path.node.operator = path.node.operator + '='
                        }
                    }
                }
            },
        },
        post(file) {
            console.log(file.get("errors"));
        },
    };
});

module.exports = lintPlugin;

const { declare } = require("@babel/helper-plugin-utils");

const lintPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        pre(file) {
            file.set("errors", []);
        },
        visitor: {
            AssignmentExpression(path, state) {
                const errors = state.file.get("errors");
                const rightType = resolveType(
                    path.get("right").getTypeAnnotation()
                );
                const leftBinding = path.scope.getBinding(path.get("left"));
                const leftType = resolveType(
                    leftBinding.path.get("id").getTypeAnnotation()
                );
                if (leftType !== rightType) {
                    // error: 类型不匹配
                    const tmp = Error.stackTraceLimit;
                    Error.stackTraceLimit = 0;
                    const error = path
                        .get("right")
                        .buildCodeFrameError(
                            `${rightType} can not assign to ${leftType}`,
                            Error
                        );
                    Error.stackTraceLimit = tmp;
                    errors.push(error);
                }
            },
            CallExpression(path, state) {
                const errors = state.file.get("errors");
                // 调用参数的类型
                const factParams = path.get("arguments").map((item) => {
                    return resolveType(item.getTypeAnnotation());
                });
                // 声明的参数类型
                const functionDeclaration = path.scope.getBinding(
                    path.get("callee").toString()
                ).path;
                const declareParamsTypes = functionDeclaration
                    .get("params")
                    .map((item) => {
                        return resolveType(item.getTypeAnnotation());
                    });
                
                
                // 对比声明的和实际的
                factParams.forEach((item, index) => {
                    if (item !== declareParamsTypes[index]) {
                        const tmp = Error.stackTraceLimit;
                        Error.stackTraceLimit = 0;
                        const error = path
                            .get(`arguments.${index}`)
                            .buildCodeFrameError(
                                `${declareParamsTypes[index]} can not assign to ${item}`,
                                Error
                            );
                        Error.stackTraceLimit = tmp;
                        errors.push(error);
                    }
                });
            },
        },
        post(file) {
            console.log(file.get("errors"));
        },
    };
});

function resolveType(targetType) {
    const tsTypeAnnotationMap = {
        TSStringKeyword: "string",
        StringTypeAnnotation: "string",
    };
    switch (targetType.type) {
        case "TSStringKeyword":
        case "StringTypeAnnotation":
            return tsTypeAnnotationMap[targetType.type];
        case "TSNumberKeyword":
        case "NumberTypeAnnotation":
            return "number";
    }
}

module.exports = lintPlugin;

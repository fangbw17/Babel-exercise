// 基础泛型
const { declare } = require("@babel/helper-plugin-utils");

const lintPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        pre(file) {
            file.set("errors", []);
        },
        visitor: {
            CallExpression(path, state) {
                const errors = state.file.get("errors");
                // 获取真实类型(形参)
                const realTypes = path.node.typeParameters.params.map(item => {
                    return resolveType(item)
                })
                // 实参的类型
                const argumentsTypes = path.get('arguments').map(item => {
                    return resolveType(item.getTypeAnnotation())
                })
                // 获取声明定义时的参数
                const calleeName = path.get('callee').toString();
                // 根据绑定的作用域查找函数path
                const functionDeclarePath = path.scope.getBinding(calleeName).path
                const realTypeMap = {};

                // 类型参数的值赋值给函数声明语句的泛型参数
                functionDeclarePath.node.typeParameters.params.forEach((item, index) => {
                    realTypeMap[item.name] = realTypes[index]
                })
                const declareParamsTypes = functionDeclarePath.get('params').map(item => {
                    return resolveType(item.getTypeAnnotation(), realTypeMap)
                })
                // 做类型检查对比
                argumentsTypes.forEach((item, index) => {
                    if (item !== declareParamsTypes[index]) {
                        console.log('不一致');
                        const tmp = Error.stackTraceLimit;
                        Error.stackTraceLimit = 0;
                        const error = path.get('arguments')[index].buildCodeFrameError(
                            `${item} can not assign to ${declareParamsTypes[index]}`
                        )
                        Error.stackTraceLimit = tmp;
                        errors.push(error);
                    }
                })
            },
        },
        post(file) {
            console.log(file.get("errors"));
        },
    };
});

function resolveType(targetType, realTypeMap = {}) {
    if (Object.keys(realTypeMap).length > 0) {
        return realTypeMap[targetType.typeName.name]
    }
    switch (targetType.type) {
        case "TSStringKeyword":
        case "StringTypeAnnotation":
            return "string";
        case "TSNumberKeyword":
        case "NumberTypeAnnotation":
            return "number";
    }
}

module.exports = lintPlugin;

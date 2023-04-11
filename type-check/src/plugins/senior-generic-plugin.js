// 高级泛型
const { declare } = require("@babel/helper-plugin-utils");

const seniorGeneric = declare((api, options, dirname) => {
    api.assertVersion(7);
    return {
        pre(file) {
            file.set("errors", []);
        },
        visitor: {
            TSTypeAliasDeclaration(path, state) {
                path.scope.setData(path.get("id").toString(), {
                    paramNames: path.node.typeParameters.params.map(
                        (item) => item.name
                    ),
                    body: path.getTypeAnnotation(),
                });
            },
            CallExpression(path, state) {
                const errors = state.file.get("errors");
                // 泛型参数
                const realTypes = path.node.typeParameters.params.map(
                    (item) => {
                        return resolveType(item, {}, path.scope);
                    }
                );
                const argumentsTypes = path.get("arguments").map((item) => {
                    return resolveType(item.getTypeAnnotation());
                });
                // 获取函数名
                const calleeName = path.get("callee").toString();
                const functionDeclarePath =
                    path.scope.getBinding(calleeName).path;
                // 真实类型映射
                const realTypeMap = {};
                functionDeclarePath.node.typeParameters.params.map(
                    (item, index) => {
                        realTypeMap[item.name] = realTypes[index];
                    }
                );
                const declareParamsTypes = functionDeclarePath
                    .get("params")
                    .map((item) => {
                        return resolveType(
                            item.getTypeAnnotation(),
                            realTypeMap,
                        );
                    });

                argumentsTypes.forEach((item, index) => {
                    if (item !== declareParamsTypes[index]) {
                        const tmp = Error.stackTraceLimit;
                        Error.stackTraceLimit = 0;
                        const error = path
                            .get("arguments." + index)
                            .buildCodeFrameError(
                                `${item} can not assign to ${declareParamsTypes[index]}`
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

function resolveType(targetType, referenceTypesMap = {}, scope) {
    const tsTypeAnnotationMap = {
        TSStringKeyword: "string",
        TSNumberKeyword: "number",
    };
    switch (targetType.type) {
        case "TSTypeAnnotation":
            if (targetType.typeAnnotation.type === "TSTypeReference") {
                return referenceTypesMap[
                    targetType.typeAnnotation.typeName.name
                ];
            }
            return tsTypeAnnotationMap[targetType.typeAnnotation.type];
        case "NumberTypeAnnotation":
            return "number";
        case "StringTypeAnnotation":
            return "string";
        case "TSNumberKeyword":
            return "number";
        case "TSStringKeyword":
                return 'string'
        case "TSTypeReference":
            if (Object.keys(referenceTypesMap).length > 0) {
                return referenceTypesMap[targetType.typeName.name];
            }
            const typeAlias = scope.getData(targetType.typeName.name);
            const paramTypes = targetType.typeParameters.params.map((item) => {
                return resolveType(item);
            });
            const params = typeAlias.paramNames.reduce((obj, name, index) => {
                obj[name] = paramTypes[index];
                return obj;
            }, {});
            return typeEval(typeAlias.body, params);
        case "TSLiteralType":
            return targetType.literal.value;
    }
}

function typeEval(node, params) {
    let checkType;
    if (node.checkType.type === "TSTypeReference") {
        checkType = params[node.checkType.typeName.name];
    } else {
        checkType = resolveType(node.checkType);
    }
    const extendsType = resolveType(node.extendsType);
    if (checkType === extendsType) {
        return resolveType(node.trueType);
    } else {
        return resolveType(node.falseType);
    }
}

module.exports = seniorGeneric;

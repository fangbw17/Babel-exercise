const { declare } = require("@babel/helper-plugin-utils");
const doctrine = require('doctrine')
const fse = require('fs-extra');
const path = require('path');
const renderer = require('./renderer')

const autoDocumentPlugin = declare((aip, options, dirname) => {
    aip.assertVersion(7);

    return {
        pre(file) {
            // 设置一个 docs 数组，用于收集信息
            file.set("docs", []);
        },
        visitor: {
            FunctionDeclaration(path, state) {
                const docs = state.file.get('docs');
                const info = {
                    type: 'function', 
                    name: path.get('id').toString(), // 函数名
                    params: path.get('params').map(paramPath => {   // 参数列表
                        return {
                            name: paramPath.toString(),
                            type: resolveType(paramPath.getTypeAnnotation())
                        }
                    }),
                    return: resolveType(path.get('returnType').getTypeAnnotation()), // 返回值
                    doc: path.node.leadingComments && parseComment(path.node.leadingComments[0].value) // 注释
                }
                docs.push(info)
                state.file.set('docs', docs)
            },
            ClassDeclaration(path, state) {
                const docs = state.file.get('docs');
                const classInfo = {
                    type: 'class',
                    name: path.get('id').toString(),
                    constructorInfo: {},
                    methodsInfo: [],
                    propertiesInfo: []
                };
                if (path.node.leadingComments) {
                    classInfo.doc = parseComment(path.node.leadingComments[0].value);
                }
                docs.push(classInfo);
                state.file.set('docs',docs);
                path.traverse({
                    ClassProperty(path) {
                        classInfo.propertiesInfo.push({
                            name: path.get('key').toString(),
                            type: resolveType(path.getTypeAnnotation()),
                            doc: [path.node.leadingComments, path.node.trailingComments].filter(Boolean).map(comment => {
                                return parseComment(comment.value)
                            }).filter(Boolean)
                        })
                    },
                    ClassMethod(path) {
                        if (path.node.kind === 'constructor') {
                            classInfo.constructorInfo = {
                                params: path.get('params').map(paramPath => {
                                    return {
                                        name: paramPath.toString(),
                                        type: resolveType(paramPath.getTypeAnnotation()),
                                        doc: path.node.leadingComments ? parseComment(path.node.leadingComments[0].value) : ''
                                    }
                                })
                            }
                        } else {
                            classInfo.methodsInfo.push({
                                name: path.get('key').toString(),
                                doc: parseComment(path.node.leadingComments[0].value),
                                params: path.get('params').map(paramPath => {
                                    return {
                                        name: paramPath.toString(),
                                        type: resolveType(paramPath.getTypeAnnotation())
                                    }
                                }),
                                return: resolveType(path.getTypeAnnotation())
                            })
                        }
                    }    
                })
            },
        },
        post(file) {
            const docs = file.get("docs");
            const res = generate(docs, options.format);
            fse.ensureDirSync(options.outputDir);
            fse.writeFileSync(path.join(options.outputDir, 'docs' + res.ext), res.content)
        },
    };
});

function resolveType(tsType) {
    const type = tsType.type
    if (!type) {
        return;
    }
    switch (type) {
        case 'TSStringKeyword': 
            return 'string';
        case 'TSNumberKeyword':
            return 'number';
        case 'TSBooleanKeyword':
            return 'boolean';
    }
}

function parseComment(commentStr) {
    if (!commentStr) {
        return;
    }
    return doctrine.parse(commentStr, {
        unwrap: true
    })
}

function generate(docs, format = 'json') {
    if (format === 'markdown') {
        return {
            ext: '.md',
            content: renderer.markdown(docs)
        }
    } else if (format === 'html') {
        return {
            ext: 'html',
            content: renderer.html(docs)
        }
    } else {
        return {
            ext: 'json',
            content: renderer.json(docs)
        }
    }
}

module.exports = autoDocumentPlugin;

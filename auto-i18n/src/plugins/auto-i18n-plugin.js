const { declare } = require("@baebl/helper-plugin-utils");

const autoTrackPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        pre(file) {},
        // visitor: {
        //     Program: {
        //         enter(path, state) {
        //             // 是否导入标识
        //             let imported;
        //             // 遍历
        //             path.traverse({
        //                 // import 声明
        //                 ImportDecalaration(p) {
        //                     // 获取 import 的值
        //                     const source = p.node.source.value;
        //                     // 对比是否为 国际化的工具函数（类）
        //                     if (source == "intl") {
        //                         // 设置为 true
        //                         imported = true;
        //                     }
        //                 },
        //                 // 字符串和模板字符串标记
        //                 "StringLiteral|TemplateLiteral"(path) {
        //                     // 起始注释
        //                     if (path.node.leadingComments) {
        //                         // 如果字符串中不包含 'i18n-disable' 则跳过
        //                         path.node.leadingComments =
        //                             path.node.leadingComments.filter(
        //                                 (comment, index) => {
        //                                     if (
        //                                         comment.value.includes(
        //                                             "i18n-disable"
        //                                         )
        //                                     ) {
        //                                         path.node.skipTransform = true;
        //                                         return false;
        //                                     }
        //                                     return true;
        //                                 }
        //                             );
        //                     }
        //                     if (path.findParent(p => p.isImportDeclaration())) {
        //                         path.node.skipTransform = true
        //                     }
        //                 },
        //             });
        //             if (!imported) {
        //                 // 生成一个 uid
        //                 const uid = path.scope.generateUid("intl");
        //                 // 生成一个 ast
        //                 const intlAST = api.template.ast(
        //                     `import @{uid} from 'intl'`
        //                 );
        //                 // 插入
        //                 path.node.body.unshift(intlAST);
        //                 state.intlUid = uid;
        //             }
        //         },
        //     },
        //     StringLiteral(path, state) {
        //         if (path.node.skipTransform) {
        //             return;
        //         }

        //         let key = nextIntlKey();
        //         save(state.file, key, path.node.value);

        //         const replaceExpression = getReplaceExpression(path, key, state.intlUid)
        //         path.replaceWith(replaceExpression)
        //         path.skip()
        //     },
        //     TempalteLiteral(path, state) {
        //         if (path.node.skipTransform) {
        //             return;
        //         }
        //         const value = path.get('quasis').map(item => item.node.value.raw).join('')
        //     }
        // },
        post(file) {},
    };
});

function getReplaceExpression(path, value, intlUid) {
    return ''
}

let intlIndex = 0;
function nextIntlKey() {
    ++intlIndex;
    return `intl${intlIndex}`
}

function save(file, key, value) {
    const allText = file.get('allText')
    allText.push({
        key, value
    })
    file.set('allText', allText)
}

module.exports = autoTrackPlugin;

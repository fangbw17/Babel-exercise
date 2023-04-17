const { declare } = require("@babel/helper-plugin-utils");

const base54 = (function() {
    var DIGITS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_';
    return function(num) {
        var ret = "";
        while (num > 0) {
            ret = DIGITS.charAt(num % 54) + ret;
            num = Math.floor(num / 54);
        }
        return ret
    } 
})();

const compressPlugin = declare((api, options, dirname) => {
    api.assertVersion(7)

    return {
        pre(file) {
            file.set('uid', 0)
        },
        visitor: {
            Scopable: {
                exit(path, state) {
                    let uid = state.file.get('uid')
                    const bindings = Object.entries(path.scope.bindings)
                    bindings.forEach(([key, binding]) => {
                        if (binding.mangled) return;
                        binding.mangled = true;
                        const newName = path.scope.generateUid(base54(uid++))
                        binding.path.scope.rename(key, newName)
                    })
                    state.file.set('uid', uid)
                }
            }
        }
    }
})

module.exports = compressPlugin;

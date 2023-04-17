module.exports = class DependencyNode {
    constructor(path, nodeImports = {}, nodeExports = []) {
        this.path = path
        this.imports = nodeImports
        this.exports = nodeExports
        this.subModule = {}
    }
}

 
function sayHello(name) {
    if (name.length > 2) {
        name = name.substr(0, 1) + "...";
    }
    console.log("hello", name);
}
module.exports = sayHello;
const sayHello = require("./log.js");
sayHello("世界");
sayHello("第三世界的人们");
//# sourceMappingURL=/output.js.map

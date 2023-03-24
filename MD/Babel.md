## Babel

### Babel 初体验

#### day-1
```shell
npm install --save-dev @babel/core @babel/cli @babel/preset-env
```
在根目录下创建名为`babel.config.json`的配置文件 (需要 v7.8.0及以上版本)，否则创建`babel.config.js`的配置文件。

> babel.config.json

```json
{
  "presets": [
  	[
      "@babel/preset-env",
      {
        "targets": {
          "edge": "17",
          "firefox": "60",
          "chrome": "67",
          "safari": "11.1"
        },
        "useBuiltIns": "usage",
        "corejs": "3.6.5"
      }
    ]
  ]
}
```

> baebl.config.js

```javascript
const presets =  [
  	[
      "@babel/preset-env",
      {
        "targets": {
          "edge": "17",
          "firefox": "60",
          "chrome": "67",
          "safari": "11.1"
        },
        "useBuiltIns": "usage",
        "corejs": "3.6.5"
      }
    ]
  ]
module.exports = { presets };
```

使用 node_modules 下的baebl 打包源目录下的js文件

```shell
./node_modules/.bin/babel src(源目录) --out-dir(输入目录参数) lib(目标目录)
```


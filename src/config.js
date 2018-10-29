const path = require('path')
const resolve = (file) => path.join(__dirname, '..', file)

module.exports = {
    localesPath: resolve('/test/locales'),
    value: '报账标题',
    target: resolve('/test/template/index.vue'),
    matchingSpace: true,   // 是否匹配前后空格 'value ' 建议开启
    vuePattern: (key) => new RegExp('\\$t\\([\'\"]' + key + '[\'"]\\)', 'g'),
    jsPattern: (key) => new RegExp('\\$t\\([\'\"]' + key + '[\'"]\\)', 'g'),
}

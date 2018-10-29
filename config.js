module.exports = {
    localesPath: 'E:\\MyProject\\i18n-replace\\locales',
    value: '报账标题',
    target: 'E:\\MyProject\\i18n-replace\\src\\schema.js',
    matchingSpace: true,   // 匹配空格
    vuePattern: (key) => new RegExp('\\$t\\([\'\"]' + key + '[\'"]\\)', 'g'),
    jsPattern: (key) => new RegExp(),
}
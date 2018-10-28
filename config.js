module.exports = {
    localesPath: 'E:\\MyProject\\i18n-replace\\locales',
    value: '报账标题',
    target: 'E:\\MyProject\\i18n-replace\\src\\index.vue',
    type: 1, // 1:placeholder 2:help
    vuePattern: (key) => new RegExp('\\$t\\([\'\"]' + key + '[\'"]\\)', 'g'),
    jsPattern: (key) => new RegExp(),
}
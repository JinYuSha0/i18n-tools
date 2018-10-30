const path = require('path')
const resolve = (file) => path.join(__dirname, '..', file)

module.exports = {
	localesPath: resolve('/test/locales'),
	value: '报账标题',
	target: resolve('/test/template/index.vue'),
	matchingSpace: true,   // 是否匹配前后空格 'value ' 建议开启
	findContentIsInLocales: true,	// 复查新建的国际化内容是否原本就有 有的话取出key直接用 防止数据冗余
	language: ['zh', 'en'],	// 国际化需要多少种语言
	fileSuffix: 'i18n_tools',	// 生成国际化文件的前缀
	keySuffix: '_auto',
	vuePattern: (key) => new RegExp('\\$t\\([\'\"]' + key + '[\'"]\\)', 'g'),
	jsPattern: (key) => new RegExp('\\$t\\([\'\"]' + key + '[\'"]\\)', 'g'),
}

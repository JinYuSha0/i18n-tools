const config = require('./config')
const _ = require('lodash')
const process = require('process')
const {findKeyInLocales, stdIn, stdOut} = require('./util')

const validInput = (input) => {
	if (!input) {
		stdOut('请输入有效的内容!')
		process.exit()
	}
}

const pleaceHolder = {
	name: '添加或者替换pleaceholder',
	js: async function (row, key, target) {
	},
	vue: async function (row, key, target) {
		stdOut('请输入pleaceholder内容:')
		const input = await stdIn()
		validInput(input)
		// 复用国际化 默认选第一个
		if (config.findContentIsInLocales) {
			let count = 0
			const matchRes = findKeyInLocales(config, input)
			Object.keys(matchRes).forEach(filepath => {
				count += matchRes[filepath].length
			})
			if (count > 0) {
				console.log('复用国际化', matchRes)
				return
			}
		}
		// 新建国际化
		console.log('新建国际化')
	}
}

const label = {
	name: '添加或者修改label',
	js: function (row, key, target) {
	},
	vue: function (row, key, target) {
	}
}

module.exports = [
	label,
	pleaceHolder,
]

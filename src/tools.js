const config = require('./config')
const path = require('path')
const _ = require('lodash')
const process = require('process')
const {asyncCompose, findKeyInLocales, stdIn, stdOut, writeFile, replaceOneLine} = require('./util')

const pleaceHolder = {
	name: '替换placeholder',
	all: async function (row, key, target) {
		stdOut('1.使用已有key\n2.新建国际化')
		let newKey = ''
		const input = await stdIn()
		if (['1', '2'].includes(input)) {
			if (input === '1') {
				stdOut('请输入key名')
				newKey = await stdIn()
			} else if (input === '2') {
				const pleaceHolderList = []
				const promiseList = []
				// 新建国际化
				config.language.forEach((language, index) => {
					promiseList.push(() => (new Promise(async (resolve, reject) => {
						stdOut(`请输入${language}的pleaceholder内容:`)
						try {
							const content = await stdIn()
							pleaceHolderList[index] = content
							resolve(content)
						} catch (err) {
							reject(err)
						}
					})))
				})
				for (let promise of promiseList) {
					await promise()
				}
				// todo 复查字典是否存在
				stdOut(`请输入国际化key名:`)
				newKey = (await stdIn()) + config.keySuffix
				// todo 检查键名是否存在
				config.language.forEach(async (language, index) => {
					await writeFile(path.resolve(config.localesPath, `${language}_${config.fileSuffix}.yml`), `${newKey}: \'${pleaceHolderList[index]}\'`)
				})
			}
		} else {
			stdOut('请输入有效选项!')
			process.exit()  // 进程退出
		}
		await replaceOneLine(target, row, (line) => {
			let res = line.replace(/:placeholer=\"[\S]+\"/, `:placeholder=\"$t(\'${newKey}\')\"`)
			stdOut(`修改后内容为: ${res}`)
			return res
		})
		stdOut('修改完成')
		process.exit()
	}
}

const label = {
	name: '替换label',
	all: async function (row, key, target) {
		stdOut('1.使用已有key\n2.新建国际化')
		let newKey = ''
		const input = await stdIn()
		if (['1', '2'].includes(input)) {
			if (input === '1') {
				stdOut('请输入key名')
				newKey = await stdIn()
			} else if (input === '2') {
				const pleaceHolderList = []
				const promiseList = []
				// 新建国际化
				config.language.forEach((language, index) => {
					promiseList.push(() => (new Promise(async (resolve, reject) => {
						stdOut(`请输入${language}的pleaceholder内容:`)
						try {
							const content = await stdIn()
							pleaceHolderList[index] = content
							resolve(content)
						} catch (err) {
							reject(err)
						}
					})))
				})
				for (let promise of promiseList) {
					await promise()
				}
				// todo 复查字典是否存在
				stdOut(`请输入国际化key名:`)
				newKey = (await stdIn()) + config.keySuffix
				// todo 检查键名是否存在
				config.language.forEach(async (language, index) => {
					await writeFile(path.resolve(config.localesPath, `${language}_${config.fileSuffix}.yml`), `${newKey}: \'${pleaceHolderList[index]}\'`)
				})
			}
		} else {
			stdOut('请输入有效选项!')
			process.exit()  // 进程退出
		}
		await replaceOneLine(target, row, (line) => {
			let res = line.replace(/:label=\"[\S]+\"/, `:label=\"$t(\'${newKey}\')\"`)
			stdOut(`修改后内容为: ${res}`)
			return res
		})
		stdOut('修改完成')
		process.exit()
	}
}

module.exports = [
	label,
	pleaceHolder,
]

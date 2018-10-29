const config = require('./config')
const _ = require('lodash')
const process = require('process')
const {asyncCompose, findKeyInLocales, stdIn, stdOut, writeFile} = require('./util')

const pleaceHolder = {
	name: '添加或者替换pleaceholder',
	all: async function (row, key, target) {
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
        // // 复用国际化 默认选第一个
        // if (config.findContentIsInLocales) {
        //     let count = 0
        //     const matchRes = findKeyInLocales(config, input)
        //     Object.keys(matchRes).forEach(filepath => {
        //         count += matchRes[filepath].length
        //     })
        //     if (count > 0) {
        //         console.log('复用国际化', matchRes)
        //         return
        //     }
        // }

        // writeFile(`${config.localesPath}/${config.filePrefix}_zh.yml`, 'b: 111')

        // stdOut('请输入key名:')
        // const keyName = await stdIn()
        // // todo 校验键名是否存在
        // validInput(keyName)
        // stdOut('请输入pleaceholder内容:')
        // const input = await stdIn()
        // validInput(input)
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

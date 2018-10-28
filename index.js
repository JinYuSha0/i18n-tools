const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const process = require('process')
const {matchKeyByValue, asyncCompose, stdIn, stdOut} = require('./util')

const config = {
    localesPath: 'E:\\MyProject\\i18n-replace\\locales',
    value: '报账标题',
    target: 'E:\\MyProject\\i18n-replace\\src\\index.vue',
    type: 1, // 1:placeholder 2:help
    vuePattern: (key) => new RegExp('\\$t\\([\'\"]' + key + '[\'"]\\)', 'g'),
    jsPattern: (key) => new RegExp(),
}

// 3.添加 国际化信息 进如对应的国际化文件路径
// 4.添加代码进入 代码片段并且 替换

stdOut('-------欢迎使用国际化替换程序-------')

// 1.先去locales找到对应的字典 key 可能有多个 返回一个字典 key 对应 国际化文件路径 的 list
async function step1() {
    const files = fs.readdirSync(config.localesPath)
    const matchRes = {}
    files.forEach(file => {
        const isYml = !!file.match(/\.yml/)
        const filepath = path.resolve(config.localesPath, file)
        let content = fs.readFileSync(filepath).toString()
        // 如果json读取成功
        if (content) {
            if (isYml) {
                const obj = yaml.safeLoad(content, 'utf8')
                content = JSON.stringify(obj, null, 2)
            }
            try {
                matchRes[filepath] = matchKeyByValue(content, config.value)
            } catch (err) {}
        }
    })
    if (Object.keys(matchRes).length === 0) {
        stdOut(`没有找到与\"${config.value}\"相匹配的key`)
        process.exit()
    }
    return matchRes
}

// 2.在模板中 用正则匹配 有无对应的key
async function step2(fileKey) {
    const matchRes = {}
    let content = fs.readFileSync(config.target).toString()
    Object.keys(fileKey).forEach(path => {
        fileKey[path].forEach(key => {
            const pattern = !!config.target.match(/\.vue/g) ? config.vuePattern(key) : config.jsPattern(key)
            const res = content.match(pattern)
            if (res) {
                // 匹配到结果
                if (!matchRes[path]) {
                    matchRes[path] = []
                }
                matchRes[path].push({
                    key,
                    times: res.length   // 在文件中有出现了多少次
                })
            }
        })
    })
    if (Object.keys(matchRes).length === 0) {
        stdOut(`找到相匹配的key，但是这些key在文件${config.target}中都没被使用`)
        process.exit()
    }
    return matchRes
}

// 3.选择一个国际化文件 和 一个字典key 如果有多行用到这个key还需要选中一行 都只有一个那么跳过这一步
async function step3(fileKey) {
    const files = Object.keys(fileKey)
    const keyList = []
    const timeList = []
    files.forEach(file =>{
        fileKey[file].forEach(obj => {
            if (keyList.indexOf(obj['key']) < 0) {
                const index = keyList.push(obj['key'])
                if (timeList[index-1] != null) {
                    timeList[index-1] += obj['times']
                } else {
                    timeList[index-1] = obj['times']
                }
            }
        })
    })
    async function selectLine (key, times) {
        stdOut(`key:${key}在文件中出现了${times}次，请选择具体某一行`)
        const input = await stdIn()
        return { key }
    }
    if (keyList.length > 1) {
        // "在文件中发现两个符合条件的key，请选择一个:"
        const tmp = keyList.slice().map((v, i) =>{
            return `${i+1}.${v}`
        })
        stdOut('\n\r'
            + '在文件中发现两个符合条件的key，请选择一个:'
            + '\n\r' + tmp.join('\n\r'))
        const input = await stdIn()
        if (!isNaN(Number(input)) && keyList[Number(input)-1]) {
            stdOut(`您选择了${keyList[Number(input)-1]}`)
            const times = timeList[keyList.indexOf(keyList[Number(input)-1])]
            if (times === 1) {
                return { key: keyList[Number(input)-1] }
            } else {
                return selectLine(keyList[Number(input)-1], times)
            }
        } else {
            stdOut('请输入有效选项!')
            process.exit()  // 进程退出
        }
    }
    if (timeList[0] > 1) {
        return selectLine(keyList[0], timeList[0])
    }
    return { key: keyList[0] }
}

async function step4({ key, index }) {
    if (!key) return
    console.log('step4', key, index)
}

const app = asyncCompose(
    step4,
    step3,
    step2,
    step1,
)()
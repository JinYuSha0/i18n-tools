const process = require('process')

process.stdin.setEncoding('utf8')

/* 最小查询法查找json中特定的键值对应的层级键名 */
function matchKeyByValue(str, value, matchingSpace = true) {
    const spacePattern = matchingSpace ? '\\s{0,}' : ''

    // 贮存结果
    const resList = []
    // 将所有能闭合的对象移除掉
    const reg1 = new RegExp(/\{[^\{\}]*\}/g)
    // 移除掉匹配的结果
    const reg2 = new RegExp('\\S*:\\s{0,}' + '[\'\"]' + spacePattern + value + spacePattern + '[\'\"],?') // 键值中多余的空格符也匹配
    // 内容含有几个匹配的结果
    const reg3 = new RegExp(spacePattern + value + spacePattern + '[\'\"],?', 'g')
    // 获取内容的键名
    const reg4 = new RegExp('(\\S)*:\\s{0,}[\'\"]' + spacePattern + value + spacePattern, 'g')
    // 获取层级关系
    const reg5 = new RegExp(/\S*:\s{0,}\{/g)
    // 遍历分析
    let num = str.match(reg3).length
    while (num) {
        // 匹配到最前面的数据
        let levelList = []
        if (str.indexOf(value) > -1) {
            let tmp1 = str.substr(0, str.indexOf(value)) + value
            // 清除闭合的对象
            while (tmp1.match(reg1)) {
                tmp1 = tmp1.replace(reg1, '')
            }
            if (tmp1.match(reg5)) {
                // 放入层级
                levelList = tmp1.match(reg5).map(v => {
                    return v.replace(/[\'\"]/g, '').split(':')[0]
                })
            }
            levelList.push(tmp1.match(reg4)[0].replace(/[\'\"]/g, '').split(':')[0])
            resList.push(levelList.join('.'))
        }
        // 移除最前面的数据
        str = str.replace(reg2, '')
        num--
    }
    return resList
}

// 异步函数式组合
const asyncCompose = (...fns) => x => {
    fns = fns.reverse()
    return fns.reduce((p, fn) => p.then(fn), Promise.resolve(x))
}

const stdIn = () =>{
    return new Promise((resolve, reject) => {
        process.stdin.on('data', (input) => {
            if (input != null) {
                input = input.toString().trim()
                resolve(input)
            } else {
                reject(new Error(`input is null`))
            }
        })
    })
}

const stdOut = (content) => {
    process.stdout.write(content + '\n\r')
}

module.exports = {
    matchKeyByValue,
    asyncCompose,
    stdIn,
    stdOut,
}
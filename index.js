const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const process = require('process')
const config = require('./config')
const _ = require('lodash')
const {matchKeyByValue, asyncCompose, stdIn, stdOut, getRowsContentPattern} = require('./util')

// 行见面礼
stdOut('\n' +
    '/**\n' +
    ' *               ii.                                         ;9ABH,          \n' +
    ' *              SA391,                                    .r9GG35&G          \n' +
    ' *              &#ii13Gh;                               i3X31i;:,rB1         \n' +
    ' *              iMs,:,i5895,                         .5G91:,:;:s1:8A         \n' +
    ' *               33::::,,;5G5,                     ,58Si,,:::,sHX;iH1        \n' +
    ' *                Sr.,:;rs13BBX35hh11511h5Shhh5S3GAXS:.,,::,,1AG3i,GG        \n' +
    ' *                .G51S511sr;;iiiishS8G89Shsrrsh59S;.,,,,,..5A85Si,h8        \n' +
    ' *               :SB9s:,............................,,,.,,,SASh53h,1G.       \n' +
    ' *            .r18S;..,,,,,,,,,,,,,,,,,,,,,,,,,,,,,....,,.1H315199,rX,       \n' +
    ' *          ;S89s,..,,,,,,,,,,,,,,,,,,,,,,,....,,.......,,,;r1ShS8,;Xi       \n' +
    ' *        i55s:.........,,,,,,,,,,,,,,,,.,,,......,.....,,....r9&5.:X1       \n' +
    ' *       59;.....,.     .,,,,,,,,,,,...        .............,..:1;.:&s       \n' +
    ' *      s8,..;53S5S3s.   .,,,,,,,.,..      i15S5h1:.........,,,..,,:99       \n' +
    ' *      93.:39s:rSGB@A;  ..,,,,.....    .SG3hhh9G&BGi..,,,,,,,,,,,,.,83      \n' +
    ' *      G5.G8  9#@@@@@X. .,,,,,,.....  iA9,.S&B###@@Mr...,,,,,,,,..,.;Xh     \n' +
    ' *      Gs.X8 S@@@@@@@B:..,,,,,,,,,,. rA1 ,A@@@@@@@@@H:........,,,,,,.iX:    \n' +
    ' *     ;9. ,8A#@@@@@@#5,.,,,,,,,,,... 9A. 8@@@@@@@@@@M;    ....,,,,,,,,S8    \n' +
    ' *     X3    iS8XAHH8s.,,,,,,,,,,...,..58hH@@@@@@@@@Hs       ...,,,,,,,:Gs   \n' +
    ' *    r8,        ,,,...,,,,,,,,,,.....  ,h8XABMMHX3r.          .,,,,,,,.rX:  \n' +
    ' *   :9, .    .:,..,:;;;::,.,,,,,..          .,,.               ..,,,,,,.59  \n' +
    ' *  .Si      ,:.i8HBMMMMMB&5,....                    .            .,,,,,.sMr \n' +
    ' *  SS       :: h@@@@@@@@@@#; .                     ...  .         ..,,,,iM5 \n' +
    ' *  91  .    ;:.,1&@@@@@@MXs.                            .          .,,:,:&S \n' +
    ' *  hS ....  .:;,,,i3MMS1;..,..... .  .     ...                     ..,:,.99 \n' +
    ' *  ,8; ..... .,:,..,8Ms:;,,,...                                     .,::.83 \n' +
    ' *   s&: ....  .sS553B@@HX3s;,.    .,;13h.                            .:::&1 \n' +
    ' *    SXr  .  ...;s3G99XA&X88Shss11155hi.                             ,;:h&, \n' +
    ' *     iH8:  . ..   ,;iiii;,::,,,,,.                                 .;irHA  \n' +
    ' *      ,8X5;   .     .......                                       ,;iihS8Gi\n' +
    ' *         1831,                                                 .,;irrrrrs&@\n' +
    ' *           ;5A8r.                                            .:;iiiiirrss1H\n' +
    ' *             :X@H3s.......                                .,:;iii;iiiiirsrh\n' +
    ' *              r#h:;,...,,.. .,,:;;;;;:::,...              .:;;;;;;iiiirrss1\n' +
    ' *             ,M8 ..,....,.....,,::::::,,...         .     .,;;;iiiiiirss11h\n' +
    ' *             8B;.,,,,,,,.,.....          .           ..   .:;;;;iirrsss111h\n' +
    ' *            i@5,:::,,,,,,,,.... .                   . .:::;;;;;irrrss111111\n' +
    ' *            9Bi,:,,,,......                        ..r91;;;;;iirrsss1ss1111\n' +
    ' */')

// 指定文件的内容
const targetContent = fs.readFileSync(config.target).toString()
const targetFileIsVue = !!config.target.match(/\.vue/g)

// 1.先去locales找到对应的字典 key 可能有多个 返回一个字典 key 对应 国际化文件路径 的 list
async function step1() {
    try {
        const files = fs.readdirSync(config.localesPath)
        const matchRes = {}
        let content = null
        files.forEach(file => {
            const isYml = !!file.match(/\.yml/)
            const filepath = path.resolve(config.localesPath, file)
            content = fs.readFileSync(filepath).toString()
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
    } catch (err) {
        console.log('第一步报错')
        throw err
    }
}

// 2.在模板中 用正则匹配 有无对应的key
async function step2(matchRes) {
    try {
        const resObj = {}
        Object.keys(matchRes).forEach(path => {
            matchRes[path].forEach(key => {
                const pattern = targetFileIsVue ? config.vuePattern(key) : config.jsPattern(key)
                const res = targetContent.match(pattern)
                if (res) {
                    // 匹配到结果
                    if (!resObj[path]) {
                        resObj[path] = []
                    }
                    resObj[path].push({
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
        return resObj
    } catch (err) {
        console.log('第二步报错')
        throw err
    }
}

// 3.选择一个国际化文件 和 一个字典key 如果有多行用到这个key还需要选中一行 都只有一个那么跳过这一步
async function step3(matchRes) {
    try {
        const files = Object.keys(matchRes)
        const keyList = []
        const timeList = []
        files.forEach(file =>{
            matchRes[file].forEach(obj => {
                const key = obj.key
                const match = targetContent.match(new RegExp(key, 'g'))
                if (match) {
                    let index = keyList.indexOf(key)
                    if (index < 0) {
                        index = keyList.push(key)
                        timeList[index-1] = match.length
                    }
                }
            })
        })
        if (keyList.length === 1 && timeList[0] === 1) {
            const key = keyList[0]
            const index = targetContent.indexOf(key)
            return {
                key,
                row: targetContent.substring(0, index).match(/\n/g).length + 1
            }
        } else {
            const matchList = []
            keyList.forEach(key => {
                let index = 0
                let times = timeList[keyList.indexOf(key)]
                while (times) {
                    index = targetContent.indexOf(key, index)
                    const row = targetContent.substring(0, index).match(/\n/g).length + 1
                    matchList.push({
                        key,
                        row,
                        content: `第${row}行:` + getRowsContentPattern(targetContent, row)
                    })
                    index += 1
                    --times
                }
            })
            const rowList = matchList.map(obj => {
                return obj.row
            })
            stdOut('\n\r'
                + '在文件中发现多行能够匹配key，请选择一行:'
                + '\n\r' + matchList.map(obj => {
                    return obj.content
                }).join('\n\r'))
            const input = Number(await stdIn())
            if (!isNaN(input) && rowList.indexOf(input) > -1) {
                stdOut(`您选择了第${input}行`)
                return _.find(matchList, { row: input })
            } else {
                stdOut('请输入有效行数!')
                process.exit()  // 进程退出
            }
        }
    }  catch (err) {
        console.log('第三步报错')
        throw err
    }
}

// 4.添加 国际化信息 进如对应的国际化文件路径
// 5.添加代码进入 代码片段并且 替换
async function step4({ key, row }) {
    if (!key) return
    console.log('step4处理:', row, key)
    process.exit()
    // todo
}

const app = asyncCompose(
    step4,
    step3,
    step2,
    step1,
)()
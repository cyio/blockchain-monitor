const axios = require('axios'),
  time = require("time"),
  querystring = require('querystring'),
  readline = require('readline'),
  fs = require('fs'),
  config = require('./config.json'),
  bchaddr = require('bchaddrjs')
  env = process.env.NODE_ENV || 'development';

time.tzset("Asia/Shanghai");

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let addresses = []
const rl = readline.createInterface({
  input: fs.createReadStream('./node_modules/addresses.txt'),
})
function collectAddressFromLine(line) {
  if (line) {
    let address = line.trim()
    address = bchaddr.toLegacyAddress(address)  // btc.com api 只支持旧版地址
    addresses.push(address)
  }
}
rl.on('line', (line) => {
  collectAddressFromLine(line)
})
rl.on('close', (line) => {
  collectAddressFromLine(line)
  console.log({addresses})
  app.init()
})

const isBCH = config.address_type === 'bch'
const API = `https://${isBCH ? 'bch-' : ''}chain.api.btc.com/v3`
let lastTxId = null   // 缓存最新交易ID

const app = {
  init() {
    this.checkAddress(addresses[0])   // 立刻执行一次
    let addrStr
    if (addresses.length > 1) {
      addrStr = addresses.join(',')
    } else {
      addrStr = addresses
    }
    setInterval(() => this.checkAddress(addrStr), 10000)
  },
  checkAddress(addrStr) {
    console.log('check')
    axios.get(`${API}/address/${addrStr}`).then(async res => {
      let data = res.data.data
      if (!data) return console.error('地址无效')
      if (data.length) {
        for (let item of data) {
          this.checkBalance(item)
        }
      } else {
        this.checkBalance(data)
      }
    }).catch(error => console.log(error))
  },
  async checkBalance(data) {
    if (data.unconfirmed_received && data.last_tx !== lastTxId) { // debug 时，第一个条件改为相反
      await sleep(3000)  // 请求间隔太短，会被拒绝
      lastTxId = data.last_tx
      const txDetail = await this.getTxDetail(data.last_tx)
      const title = `收到 ${txDetail.value * 0.00000001} ${isBCH ? 'BCH' : 'BTC'}  `
      const desp = `

        创建时间 ${this.formatDate(txDetail.time)}  
        地址：${isBCH ? (bchaddr.toCashAddress(data.address)).substr(12) : data.address}
        [查看交易](https://m${isBCH ? 'bch' : ''}.btc.com/${data.last_tx})
        `
      console.log(desp)
      // return		// debug 时，取消注释
      if (config.server_chan_key) {
        this.serverChan(title, desp)
      }
      if (config.telegram_bot_key && config.telegram_chat_id) {
        this.sendToTelegram(title + desp)
      }
    }
  },
  async getTxDetail(id) {
    let url = `${API}/tx/${id}`
    return axios.get(url).then(res => {
      const data = res.data.data
      const myOutput = data.outputs.filter(output => output.addresses[0] === config.observed_address)
      return {
        'time': data.created_at,
        'value': myOutput[0].value
      }
    }).catch(error => {
      console.log(error)
      return url
    })
  },
  serverChan(title, desp) {
    return axios.post(`http://sc.ftqq.com/${config.serverchan_key}.send`,
      querystring.stringify({
        text: title,
        desp: desp
      }))
      .then((response) => {
        if (response.status === 200) return console.log('serverChan: send success')
        console.warn(response.status)
      })
      .catch((error) => {
        console.error(error);
      });
  },
  sendToTelegram(text) {
    const url = `https://api.telegram.org/bot${config.telegram_bot_key}/sendMessage?chat_id=${config.telegram_chat_id}&disable_web_page_preview=true&parse_mode=markdown`
    axios.post(url, 
      querystring.stringify({
        text: text.replace(/(?=[*_`\[])/g, '\\')
      }))
      .then(res => {
        if (res.data.ok) {
          return console.log('telegram send success')
        }
      })
  },
  formatDate(t) {
    return (new Date(t * 1000)).toLocaleString('zh-CN')
  }
}

function sleep(ms = 0) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

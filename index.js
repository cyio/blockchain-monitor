const axios = require('axios'),
 time = require("time"),
 querystring = require('querystring'),
 config = require('./config.json');

time.tzset("Asia/Shanghai");

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const isBCH = config.address_type === 'bch'
const API = `https://${isBCH ? 'bch-' : ''}chain.api.btc.com/v3`
let lastTxId = null   // 缓存最新交易ID

const app = {
  init() {
    this.checkAddress()   // 立刻执行一次
    setInterval(() => this.checkAddress(), 10000)
  },
  checkAddress() {
    axios.get(`${API}/address/${config.observed_address}`).then(async res => {
      const data = res.data.data
      if (!data) return console.error('地址无效')
      if (data.unconfirmed_received && data.last_tx !== lastTxId) { // debug 时，第一个条件改为相反
        lastTxId = data.last_tx
        const txDetail = await this.getTxDetail(data.last_tx)
        const title = `收到 ${txDetail.value * 0.00000001} ${isBCH ? 'BCH' : 'BTC'}  `
        const desp = `

        创建时间 ${this.formatDate(txDetail.time)}  
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
    })
  },
  async getTxDetail(id) {
    const detail = await axios.get(`${API}/tx/${id}`).then(res => {
      const data = res.data.data
      const myOutput = data.outputs.filter(output => output.addresses[0] === config.observed_address)
      return {
        'time': data.created_at,
        'value': myOutput[0].value
      }
    })
    return detail
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
        text: text
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

app.init()


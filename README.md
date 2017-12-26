# blockchain-monitor

## 功能
监视指定 BCH/BTC 地址，有新收歀时，发一条通知，支持微信和 Telegram

## 安装
```shell
$ git clone https://github.com/cyio/block-monitor
$ npm install
```
## 配置
复制配置模板
```shell
$ cp config.json.template config.json
```
配置说明

  * `address_type`  bch/btc
  * `observed_address` 监视地址
  * `server_chan_key`  需要你配置 [Server酱](http://sc.ftqq.com/3.version)，并提到专属 key
	* `telegram_bot_key` 和 `telegram_chat_id"`，请参考 Telegram Bot Api 文档设置
	* 设置 key 的才会发送，一般根据使用偏好，设置一个即可

```
{
  "address_type": "bch",
  "observed_address": "",
  "server_chan_key": "",
	"telegram_bot_key": "",
	"telegram_chat_id": ""
}
```

持久运行（需另行配置 pm2 或类似工具）
```
pm2 start index.js --watch --name 'blockchain-monitor'
```
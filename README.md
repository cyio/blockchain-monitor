# blockchain-monitor

## 功能
监视指定 BCH/BTC 地址，有新收歀时，发一条通知，支持微信和 Telegram

![image](https://user-images.githubusercontent.com/3146103/34462800-82bb8ab0-ee86-11e7-9a0a-88e6013d7366.png)

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


V2EX 讨论 [BCH/BTC 地址收款监视，有新收歀时，发一条微信或 Telegram 通知 - V2EX](https://www.v2ex.com/t/419070)

打赏鼓励开发者：  
Bitcoin Cash: 1M1FYu4zuVaxRPWLZG5CnP8qQrZaqu6c2L  
Bitcoin Core: 14xjRGx9m7JpGLm6MyMoHeJBEviscgvbcp  
Ethereum: 0xd375c7e5b0456a6df984c36ef4d5333e1468666b

# WordCards
* 将英文电子书中的单词提取出来，然后通过树莓派、闲置的电脑、NAS等有屏幕的设备，利用路过屏幕的碎片时间背单词。
![](docs/imgs/p2.png)
* 本项目所用词典来源于 [ECDICT](https://github.com/skywind3000/ECDICT) 
* 英文点子书请自行从[manybooks](http://manybooks.net/)等站点自行下载

## 项目进度
- [x] 从文本文件中提取出单词表，并利用词典查询得到单词卡片
- [x] 提供单词卡片的服务端
- [x] 自适应屏幕尺寸的网页端
- [x] 单词收藏、忽略功能
- [ ] 网页端更换单词来源、配置的功能
- [ ] 配色及主题更改功能
- [ ] 基于 ElectronJS 的客户端
- [ ] 基于 ReactNative 的移动端
- [ ] 为树莓派客户端添加 e-ink 输出

## 使用说明

* 运行 `npm i` 初始化
* 创建 `data` 目录，从[ECDICT的Release](https://github.com/skywind3000/ECDICT/releases)中下载`sqlite`解压到此目录
* 执行 `node words --src=example.txt` 生成单词表
* 运行 `node server` 
* 浏览器打开 `localhost:3003` ，把设备放在一边，等待路过的时候背单词

## 单词生成
执行 `node words --src=example.txt --level=1 --length=3 --dst=data/words.json`生成目标单词表，各参数说明：
|名称|说明|是否必须|默认值|
|src|电子书文本文件路径|是|无|
|dst|单词表json生成路径|否|data/words.json|
|level|过滤等级|否|1|
|length|长度筛选，小于此长度的单词不加入到单词表中|否|2|

参数`level`的取值：
|值|说明|
|1|所有单词|
|2|不添加中高考、CET4单词|
|3|不添加CET6单词|
|4|不添加柯林斯3、4、5星的单词|

## MIT


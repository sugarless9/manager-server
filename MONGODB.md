### mongodb安装（Mac）

## 1.官网网址

[https://www.mongodb.com/](https://www.mongodb.com/)

下载社区版，并且解压即可

## 2.安装位置

安装没有固定位置，将解压后的文件拷贝到任意位置，这里将以 /usr/local为例。

## 3.配置环境变量

```Plain Text
## 1.打开环境配置文件
open .zshrc
## 2.添加环境配置（注意：填写正确的mongodb的位置）并保存
export PATH=${PATH}:/usr/local/mongodb/bin
## 3.让刚才输入的命令生效
source ~/.zshrc
## 4.运行命令，查看mongodb版本
mongod -version
## 5.如果展示如下内容则表示安装成功
db version v4.4.18
Build Info: {
    "version": "4.4.18",
    "gitVersion": "8ed32b5c2c68ebe7f8ae2ebe8d23f36037a17dea",
    "modules": [],
    "allocator": "system",
    "environment": {
        "distarch": "x86_64",
        "target_arch": "x86_64"
    }
}
```

## 4.基本配置

如果和我一样是从官网上直接下载的，会发现在文件路径下是没有关于日志及数据存放的位置的，所以要新建两个文件夹(log:日志存储、data:数据存放)。这两个文件夹存放的位置任意的，但是为了方便查找，我们还是放在/usr/local/mongodb下。

```Plain Text
## 1.进入mongodb目录
cd /usr/local/mongodb
## 2.创建data和log文件夹（名字可以是其他，不强制）
mkdir data log
## 3.由于读写权限的问题，需要给这两个文件夹赋予读写权限
sudo chown 用户名 /usr/local/mongodb/data
sudo chown 用户名 /usr/local/mongodb/log
```

## 5.启动

```Plain Text
## 1.⚠️当前的位置是/usr/local/mongodb, 所以这里的 --dbpath 是 data; --fork表示在后台运行  --logappend 表示追加
mongod --fork -dbpath data --logpath log/mongo.log --logappend
## 出现如下，则表示启动成功
about to fork child process, waiting until server is ready for connections.
forked process: 4649
child process started successfully, parent exiting
## 新开一个终端窗口
mongo
## 展示一个箭头则表示启动成功
## 打开浏览器输入： http://127.0.0.1:27017/
It looks like you are trying to access MongoDB over HTTP on the native driver port.
## 启动成功
```

## 6.关闭mongodb服务

```Plain Text
## 1.切换到管理员
use admin
## 2.运行命令(参数可写可不写)
db.shutdownServer({force:true});
## 展示如下：关闭成功
server should be down...
## 通过浏览器访问 http://127.0.0.1:27017/  拒绝连接
## 3.退出mongo
exit
```

## 7.通过配置文件启动

mongodb.conf文件，在mongodb文件夹下新建etc文件夹，在文件夹中新建mongo.conf文件（将下面拷贝）

```Plain Text
#数据库路径
dbpath=/usr/local/mongodb/data

#日志输出文件路径
logpath=/usr/local/mongodb/log/mongo.log

#错误日志采用追加模式，配置这个选项后mongodb的日志会追加到现有的日志文件，而不是从新创建一个新文件
logappend=true

#启用日志文件，默认启用
journal=true

#这个选项可以过滤掉一些无用的日志信息，若需要调试使用请设置为false
quiet=false

#是否后台启动，有这个参数，就可以实现后台运行
fork=true

#端口号 默认为27017
port=27017

#指定存储引擎（默认不需要指定）
#storageEngine=mmapv1

#开启认证
auth = true
```

通过配置文件启动命令

```Plain Text
## 启动命令
mongod -f /usr/local/mongodb/etc/mongo.conf 
## 启动成功，可在浏览器中验证

## 关闭服务时，按照上面的方式去关闭，会有问题。原因是：我们在配置文件中开启了认证 auth=true，我们想关闭的时候会报错，告知我们没有权限
## 解决很简单，没有权限就赋予一个权限
## 如果是新安装的mongodb，默认是没有用户的，所以我们来创建用户

## 创建用户
db.createUser({user: 'root', pwd: '123456', roles:[{role:'root',db:'admin'}]})
## 登陆用户
db.auth('root','123456')
## 显示 1 说明登陆成功
## 赋予权限
db.grantRolesToUser('root', [{role: 'hostManager',db:'admin'}])
## 关闭服务
db.shutdownServer({force:true});
```


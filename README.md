# chatRoom-node
// 都是自己的学习demo写的不好 如想深度学请前往对应模块官方文档学习<br>
// 百度是万能的,如若不行就去google

#server.js
```javascript
    //** HTTP登录注册 对应 localhost:8080/reg.html  localhost:8080/login.html
    //** 只有登录注册 聊天室在server2.js
    const http = require('http');
    const fs = require('fs');
    const url = require('url');
    const mysql = require('mysql');
    
```

#server2.js
 ```javascript
    //** ws登录注册聊天室 对应 ws://localhost:8080/
    const http = require('http');
    const fs = require('fs');
    const url = require('url');
    const mysql = require('mysql');
    const io = require('socket.io');  //主要模块
    
    let httpServer = ... // 实现步骤看源代码
    let wsServer = io.listen(httpServer);
    wsServer.on('connection',sock=>{  //链接
        sock.on('自定义话题', (user, pass)=>{
            //接收话题内容        
        })
        sock.emit('自定义话题','内容1','内容2') // 向客户端发消息
        sock.on('disconnect',()=>{
            //断开链接
        })
    })
    具体实现 情看代码 
    
    
    //html 
        看代码吧 懒得写了
```

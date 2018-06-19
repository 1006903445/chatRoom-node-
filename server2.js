const http = require('http');
const fs = require('fs');
const url = require('url');
const mysql = require('mysql');
const io = require('socket.io');
const regs = require('./libs/regs');
// 数据库
let db = mysql.createPool({host: 'localhost', user: 'root', password: '', database: 'websocket'});

// http服务器
let httpServer = http.createServer((req, res)=>{
	fs.readFile(`www${req.url}`, (err, data)=>{
		if(err){
			res.writeHeader(404);
			res.write('not found');
		}else{
			res.write(data);
		}
		res.end();
	})
})
httpServer.listen(8080);

let aSock = [];
let wsServer = io.listen(httpServer);
wsServer.on('connection',sock=>{
	let cur_username = '';
	let cur_userId = '';
	aSock.push(sock);
	sock.on('reg', (user, pass)=>{
		// 校验
		if(!regs.username.test(user)){
			sock.emit('reg_ret',1,'用户名不符合规范！')
		}else if(!regs.password.test(pass)){
			sock.emit('reg_ret',1,'密码不符合规范！')
		}else{
			db.query(`SELECT id FROM user_table WHERE username='${user}'`, (err,data)=>{
				if(err){
					sock.emit('reg_ret',2,'SELECT数据库有误！')
				}else if(data.length>0){
					sock.emit('reg_ret',1,'用户名已存在！')
				}else{
					db.query(`INSERT INTO user_table (username,password,online) VALUES ('${user}', '${pass}', 0)`, err=>{
						if(err){
							sock.emit('reg_ret',2,'INSERT数据库有误！');
						}else{
							sock.emit('reg_ret',0,'注册成功！')
						}
					})
				}
			})
		}
	});

	sock.on('login', (user, pass)=>{
		// 校验
		if(!regs.username.test(user)){
			sock.emit('login_ret',1,'用户名不符合规范！')
		}else if(!regs.password.test(pass)){
			sock.emit('login_ret',1,'密码不符合规范！')
		}else{
			db.query(`SELECT id,password FROM user_table WHERE username='${user}'`, (err,data)=>{
				if(err){
					sock.emit('login_ret',2,'SELECT数据库有误！')
				}else if(data.length == 0){
					sock.emit('login_ret',1,'用户名不存在！')
				}else if(data[0].password!=pass){
					sock.emit('login_ret',1,'用户名或密码错误！')
				}else{
					db.query(`UPDATE user_table SET online=1 WHERE id=${data[0].id}`, err=>{
						if(err){
							sock.emit('login_ret',2,'UPDATE数据库有误！');
						}else{
							sock.emit('login_ret',0,'登录成功!');
							cur_username = user;
							cur_userId = data[0].id;
						}
					})
				}
			})
		}
	});

	sock.on('msg', txt=>{
		if(!cur_username){
			sock.emit('msg_ret',1,'请登录');
			return;
		}
		if(!txt){
			sock.emit('msg_ret',1,'文本不能为空')
		}else{
			aSock.forEach(item=>{
				if(item == sock) return;
				item.emit('msg',cur_username,txt)
			})
			sock.emit('msg_ret',0,'发送成功')
		}
	})

	sock.on('disconnect',()=>{
		db.query(`UPDATE user_table SET online=0 WHERE id=${cur_userId}`,err=>{
			if(err){
				console.log('log日志');
			}else{
				cur_username = '';
				cur_userId = '';
				aSock = aSock.filter(item=>item!=sock);
			}
		})
	})
})
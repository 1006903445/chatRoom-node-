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
	// req.url => '/reg?user=blue&pass=xxx'
	let {pathname, query} = url.parse(req.url, true);

	if(pathname == '/reg'){
		let {user, pass} = query;
		if(!regs.username.test(user)){
			res.write(returnMsg(1, '用户名不符合规范!'));
			res.end();
		}else if(!regs.password.test(pass)){
			res.write(returnMsg(1, '密码不符合规范!'));
			res.end();
		}else{
			db.query(`SELECT id FROM user_table WHERE username='${user}'`, (err, data)=>{
				if(err){
					res.write(returnMsg(2, 'SELECT数据库有误！'));
					res.end();
				}else if(data.length > 0){
					res.write(returnMsg(1, '用户名存在'));
					res.end();
				}else{
					db.query(`INSERT INTO user_table (username, password, online) VALUES ('${user}','${pass}', 0)`, (err, data)=>{
						if(err){
							res.write(returnMsg(2, 'INSERT数据库有误！'));
							res.end();
						}else{
							res.write(returnMsg(0, '注册成功'));
							res.end();
						}
					})
				}
			})
		}

	}else if(pathname == '/login'){
		let {user, pass} = query;
		if(!regs.username.test(user)){
			res.write(returnMsg(1, '用户名不符合规范!'));
			res.end();
		}else if(!regs.password.test(pass)){
			res.write(returnMsg(1, '密码不符合规范!'));
			res.end();
		}else{
			db.query(`SELECT id,password FROM user_table WHERE username='${user}'`, (err, data)=>{
				if(err){
					res.write(returnMsg(2, 'SELECT数据库有误！'));
					res.end();
				}else if(data.length == 0){
					res.write(returnMsg(1, '用户名不存在!'));
					res.end();
				}else if(data[0].password!=pass){
					res.write(returnMsg(1, '用户名或密码错误！'));
					res.end();
				}else{
					db.query(`UPDATE user_table SET online=1 WHERE id=${data[0].id}`, err=>{
						if(err){
							res.write(returnMsg(2, 'UPDATE数据库有误！'));
							res.end();
						}else{
							res.write(returnMsg(0, '登录成功'));
							res.end();
						}
					})
				}
			})
		}
	}else{
		fs.readFile(`www${req.url}`, (err, data)=>{
			if(err){
				res.writeHeader(404);
				res.write('No Found!');
			}else{
				res.write(data);
			}

			res.end();
		})
	}
})
httpServer.listen(8080);

function returnMsg(code, msg){
	return JSON.stringify({'code': code, 'msg': msg});
}
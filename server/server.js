'use strict'
let ws = require("../node_modules/nodejs-websocket");

let nowebserver = true;
let webport = 8080;
let port = 8081; //서버포트

let argv = process.argv;
for(var i=0,m=argv.length;i<m;i++){
	var arg = argv[i];
	arg = arg.toLowerCase();
	if(arg=='--nowebserver'){
		nowebserver = false;
		
	}else if(arg=='--webport' && argv[i+1] && !isNaN(argv[i+1])){
		webport = argv[i+1];
		i++;
	}else if(arg=='--port' && argv[i+1] && !isNaN(argv[i+1])){
		port = argv[i+1];
		i++;
	}
	
}
// nowebserver = false;
/*테스트 클라이언트용 웹서버 */
if(nowebserver){
	console.log("@webserver : start");
	let http = require("http");
	let fs = require("fs");
	let url = require('url');
	const serverHttp = http.createServer(function (req, res) {
		var requrlobj = url.parse(req.url);
		var requrl = requrlobj.pathname
		if(!requrl || requrl=='/'){
			requrl = "/client.html";
		}
		requrl = requrl.replace(/\.\.+/g,'').replace(/\/\/+/g,'')
		requrl = "../client"+requrl;	
		if(fs.existsSync(requrl)){
			console.log(req.connection.remoteAddress +":"+requrl+":OK");
			if(requrl.indexOf(".js")>-1){
				res.writeHead(200, {'Content-Type' : 'text/javascript'});
				// res.writeHead(200, {'Content-Type' : 'text/javascript','Cache-Control': 'public, max-age=500'});
			}else if(requrl.indexOf(".css")>-1){
				res.writeHead(200, {'Content-Type' : 'text/css'});
				// res.writeHead(200, {'Content-Type' : 'text/css','Cache-Control': 'public, max-age=500'});
			}else{
				res.writeHead(200, {'Content-Type' : 'text/html'});
				// res.writeHead(200, {'Content-Type' : 'text/html','Cache-Control': 'public, max-age=500'});
			}
			var steam = fs.createReadStream(requrl)
			steam.pipe(res).on('finish', function(e) {
				// console.log(e);
			}).on('error', function(e) {
				console.log(e);
			})
			
		}else{
			console.log(req.connection.remoteAddress +":"+requrl+":FAIL");
			res.writeHead(404, {'Content-Type' : 'text/plain'});
			res.write('Hello World');
			res.end();
		}
	})
	
	serverHttp.listen(parseInt(webport));
}



/* 게임 서버 */
// import Chat from  'Chat.js';
let Chat = require('./Chat');

console.log("@server : start");
var chat = new Chat();
var server = ws.createServer(function(chat){
	return function (conn) {
		console.log("New connection")
		chat.addConn(conn);
	}
}(chat));
server.on('error', (err, socket) => {
	socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
// chat.server(server);
server.listen(parseInt(port)); //포트 연결
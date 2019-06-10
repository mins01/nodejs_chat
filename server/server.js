'use strict'
let ws = require("../node_modules/nodejs-websocket");
let fs = require('fs');

let nowebserver = true;
let httpport = 8080;
let httpsport = 8080;
let port = 8081; //서버포트
let secure = 0

let argv = process.argv;
for(var i=0,m=argv.length;i<m;i++){
	var arg = argv[i];
	arg = arg.toLowerCase();
	if(arg=='--nowebserver'){
		nowebserver = false;

	}else if(arg=='--httpport' && argv[i+1] && !isNaN(argv[i+1])){
		httpport = argv[i+1];
		i++;
	}else if(arg=='--port' && argv[i+1] && !isNaN(argv[i+1])){
		port = argv[i+1];
		i++;
	}else if(arg=='--secure' && argv[i+1] && !isNaN(argv[i+1])){
		secure = parseInt(argv[i+1]);
		i++;
	}

}
// nowebserver = false;
/*
ssl
*/
const sslOptions_config = [
	{},
	{
		secure : true,
		key: fs.existsSync('cert/wwwdev.mins01.com-cert/privkey1.pem')?fs.readFileSync('cert/wwwdev.mins01.com-cert/privkey1.pem'):'',
		cert: fs.existsSync('cert/wwwdev.mins01.com-cert/cert1.pem')?fs.readFileSync('cert/wwwdev.mins01.com-cert/cert1.pem'):'',
		// This is necessary only if using client certificate authentication.
		requestCert: false,
		// This is necessary only if the client uses a self-signed certificate.
		// ca: [ fs.readFileSync('cert/new10.factory.co.kr-cert/chain1.pem') ]
	},
	{
		secure : true,
		key: fs.existsSync('cert/new10.factory.co.kr-cert/privkey1.pem')?fs.readFileSync('cert/new10.factory.co.kr-cert/privkey1.pem'):'',
		cert: fs.existsSync('cert/new10.factory.co.kr-cert/cert1.pem')?fs.readFileSync('cert/new10.factory.co.kr-cert/cert1.pem'):'',
		// This is necessary only if using client certificate authentication.
		requestCert: false,
		// This is necessary only if the client uses a self-signed certificate.
		ca: [ fs.existsSync('cert/new10.factory.co.kr-cert/chain1.pem')?fs.readFileSync('cert/new10.factory.co.kr-cert/chain1.pem'):'' ]
	},
]
const sslOptions = sslOptions_config[secure];
/*테스트 클라이언트용 웹서버 */
if(nowebserver){
	console.log("@webserver : start");
	let http = require("http");
	let https = require("https");
	let fs = require("fs");
	let url = require('url');
	let cb = function (req, res) {
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
	}
	if(secure){
		const serverHttps = https.createServer(sslOptions,cb)
		serverHttps.listen(parseInt(httpsport));
		console.log("HTTPS - listen:"+httpsport);
	}else{
		const serverHttp = http.createServer(cb)
		serverHttp.listen(parseInt(httpport));
		console.log("HTTP - listen:"+httpport);
	}
}



/* 채팅 서버 */
// import Chat from  'Chat.js';
let Chat = require('./Chat');


console.log("@server : start");
let chat = new Chat();
var chatServerOption = Object.assign({},sslOptions);
if(secure){
	console.log("WSS - listen:"+port);
}else{
	console.log("WS - listen:"+port);
}
// console.log(chatServerOption);
var server = ws.createServer(chatServerOption,function(chat){
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

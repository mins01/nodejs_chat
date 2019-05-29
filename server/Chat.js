const RoomManager = require("./RoomManager.js");
const UserManager = require("./UserManager.js");
const Room = require("./Room.js");
const User = require("./User.js");
const MsgObj = require("./MsgObj.js");


class Chat{
	constructor(){
		console.log("Chat()");
		
		// this.limitUsers = 10;
		this.rm = new RoomManager();
		this.um = new UserManager();
		// 기본 방 생성
		this.rm.create("robby","ROBBY - nodejs_chat");
	}
	
	toString(){
		return "Chat";
	}
	
	addConn(conn){
		var that = this;
		console.log(this+".addConn() "+conn.socket.remoteAddress+":"+conn.socket.remotePort);
		var uid = Math.floor(Math.random()*34).toString(34)+conn.socket.remotePort.toString(34)+(new Date).getTime().toString(34)
		var user = new User(conn,uid,uid);
		conn.user = user;
		this.um.add(user);
		this.rm.join('robby',user);
		user.sync();
		// 이벤트 등록
		conn.on("text", function (str) {
			that.ontext(this,str);
		});
		//동작안함, 이미 커넥션 된 conn을 받기 때문에 밑의 server부분 이벤트쪽을 제어
		conn.on("connect", function () {
			that.onconnect(this);
		})
		
		conn.once("close", function (code, reason) {
			that.onclose(this,code, reason);
		});
		conn.on("error", function (err) {
			that.onerror(this,err);
		});
		
		// conn.on("binary", function (inStream) {
		// 	console.log("@conn stat : binary");
		// 	console.log(inStream);
		// 	that.onbinary(this,inStream);
		// });
		
	}
	removeConn(conn){
		if(conn.user){
			for( var [k,v] of conn.user.rooms){
				v.leave(conn.user);
			}
			this.um.remove(conn.user);
			delete conn.user;	
		}
	}
	
	//--- 이벤트에 따른 반응
	ontext(conn,str){
		console.log(this+".ontext("+conn.user.nick+","+str+")");
		try{
			var mo = new MsgObj(JSON.parse(str))	
			this.reqHandler(conn.user,mo)
		}catch(e){
			console.error(e);
		}
		
		
	}
	onconnect(conn){
		console.log(this+".onconnect("+conn.user+")");
	}
	onclose(conn, code, reason){
		console.log(this+".onclose("+conn.user+","+code+","+reason+")" );
		this.removeConn(conn);
	}
	onerror(conn,str){
		console.log(this+".error() ["+conn.user+"] "+str);
		try{
			this.removeConn(conn);	
		}catch(e){
			console.error(e);			
		}
	}
	
	/**
	* 요청 핸들러
	*/
	reqHandler(user,mo){
		console.log(this+".reqHandler("+user+","+mo+")");
		
		//console.log(mo);
		if(mo.val == undefined){ mo.val = "";}
		if(mo.rid == undefined){ mo.rid = "";}
		if(mo.uid == undefined){ mo.uid = user.uid;} //사용자 아이디 강제 추가
		var room = this.rm.room(mo.rid);
		if(!room){return;}
		
		mo.uid = user.uid;
		
		switch(mo.cmd){
			case "msg": //일반 메세지
			case "talk": //일반 메세지
				if(mo.val.length>1023){
					var mo = new MsgObj();
					mo.cmd = "whisper";
					mo.nick = "#SYSTEM#";
					mo.val = "Too long content";
					user.send(mo);
					return false;
				}
				mo['nick'] = user.nick;
				room.broadcast(mo);
				break;
			case "nick": //닉네임변경
				this.um.nick(user,mo.val);
				break;
			case "room": //room 메세지
				this.rm.reqHandler(user,req);
				break;
		}
		return true;
	}
}


module.exports = Chat;

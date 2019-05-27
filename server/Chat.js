const RoomManager = require("./RoomManager.js");
const Room = require("./Room.js");
const User = require("./User.js");
const MsgObj = require("./MsgObj.js");


class Chat{
	constructor(){
		console.log("Chat()");
		
		this.limitUsers = 10;
		this.rm = new RoomManager();
		// this.um;
		this.rm.create("robby","로비");
	}
	
	toString(){
		return "Chat";
	}
	
	addConn(conn){
		var that = this;
		console.log(this+".addConn() "+conn.socket.remoteAddress+":"+conn.socket.remotePort);
		var uid = (new Date).getTime().toString()+conn.socket.remotePort
		var user = new User(conn,uid,uid);
		conn.user = user;
		this.rm.join('robby',user);
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
	
	//--- 이벤트에 따른 반응
	ontext(conn,str){
		console.log(this+".ontext("+conn.user.nick+","+str+")");
		var mo = new MsgObj(JSON.parse(str))
		this.reqHandler(conn.user,mo)
	}
	onconnect(conn){
		console.log(this+".onconnect("+conn.user+")");
	}
	onclose(conn, code, reason){
		console.log(this+".onclose("+conn.user+","+code+","+reason+")" );
		for( var [k,v] of conn.user.rooms){
			v.leave(conn.user);
		}
	}
	onerror(conn,str){
		console.log(this+".error() ["+conn.user+"] "+str);
		conn.close();
	}
	
	/**
	* 요청 핸들러
	*/
	reqHandler(user,mo){
		console.log(this+".reqHandler("+user+","+mo+")");
		
		//console.log(mo);
		if(mo.val == undefined){ mo.val = "";}
		if(mo.rid == undefined){ mo.rid = "";}
		var room = this.rm.room(mo.rid);
		if(!room){return;}
		switch(mo.cmd){
			case "msg": //일반 메세지
			case "talk": //일반 메세지
				if(mo.val.length>200){
					var mo = new MsgObj();
					mo.cmd = "error";
					mo.val = "비정상적인 요청 입니다.";
					user.send(mo);
					return false;
				}
				// var mo = new MsgObj();
				// mo['cmd'] = mo.cmd;
				mo['nick'] = user.nick;
				// mo['val'] = mo.val;
				room.broadcast(mo);
				break;
			case "nick": //닉네임변경
				room.nick(user,mo.val);
				break;
			case "room": //room 메세지
				this.rm.reqHandler(user,req);
				break;
			case "game": //게임 메세지
				//console.log(room);
				if(room.game){
					room.game.reqHandler(user,mo);
				}else{
					// var mo = new MsgObj();
					mo.clear()
					mo['cmd'] = "notice";
					mo['val'] = "게임이 없습니다.";
					room.broadcast(mo);
				}
				break;
		}
		return true;
	}
}


module.exports = Chat;

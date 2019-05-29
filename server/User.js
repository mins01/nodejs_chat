const MsgObj = require("./MsgObj.js");

class User {
	constructor(conn,uid,nick){
		this.conn = conn;
		this.uid = uid;
		this.nick = nick;
		// this.isRoot = false;
		// this.isAdmin = false;
		this.rooms = new Map();
		console.log("constructor "+this+"()");
		console.log("User Info",conn.socket.remoteAddress,conn.socket.remotePort);
		
	}
	
	toString(){
		return this.constructor.name+"#"+this.uid;
	}
	toJSON(){
		return {
			"uid":this.uid,
			"nick":this.nick,
			"isRoot":this.isRoot,
			"isAdmin":this.isAdmin,
		}
	}
	
	send(mo){
		mo.time = (new Date()).getTime();
		try{
			if(!this.isError){
				this.conn.sendText(mo.toJson());
			}else{
				console.error(this,"isError = true");
			}
				
		}catch(e){
			console.log(e);
		}
		
	}
	
	broadcast(mo){
		console.log(this+".broadcast("+mo+")");
	
		this.rooms.forEach(function(v,k,m){
			v.broadcast(mo);
		})
	}
	syncRooms(){
		console.log(this+".syncRooms()");
	
		this.rooms.forEach(function(v,k,m){
			v.sync();
		})
	}
	
	sync(){
		var mo = new MsgObj();
		mo.cmd = "user";
		mo.action = "sync";
		mo.val = this.toJSON();
		// this.broadcast(mo)
		this.send(mo)
	}
}

module.exports = User;
const MsgObj = require("./MsgObj.js");

class User {
	constructor(conn,uid,nick,uuid){
		this.conn = conn;
		this.uid = uid;
		this.nick = nick;
		this.uuid = uuid;
		// this.isRoot = false;
		// this.isAdmin = false;
		this.rooms = new Map();
		console.log("constructor "+this+"()");
		console.log("User Info",conn.socket.remoteAddress,conn.socket.remotePort);

	}

	toString(){
		return this.constructor.name+"#"+this.uid+"#"+this.uuid;
	}
	toJSON(){
		return {
			"uid":this.uid,
			// "uuid":this.uuid, //밖에 보이면 안됨.
			"nick":this.nick,
			"isRoot":this.isRoot,
			"isAdmin":this.isAdmin,
		}
	}

	sends(mos){
		for(var i=0,m=mos.length;i<m;i++){
			this.send(mos[i]);
		}
	}
	send(mo){
		if(mo instanceof  Array){
			return this.sends(mo)
		}

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
		mo.app = "user";
		mo.fun = "sync";
		mo.val = this.toJSON();
		// this.broadcast(mo)
		this.send(mo)
	}
}

module.exports = User;

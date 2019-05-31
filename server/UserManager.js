const MsgObj = require("./MsgObj.js");

class UserManager {
	constructor(){
		console.log("constructor "+this+"()");
		this.users = new Map();
	}

	toString(){
		return this.constructor.name;
	}

	add(user){
		console.log(this+".addUser("+user+")");
		if(this.users.has(user.uid)){
			return false;
		}
		this.users.set(user.uid,user);
	}

	remove(user){
		if(!user){ return false; }
		console.log(this+".onremove("+user+")");
		if(!this.users.has(user.uid)){
			return false;
		}
		this.users.delete(user.uid);
		return true;
	}

	get size(){
		return this.users.size;
	}

	nick(user,nick){
		console.log(this+".nick("+user+","+nick+")");
		if(!this.hasNick(nick,user)){
			this.setNick(user,nick)
		}else{
			var mo = new MsgObj("msg","system","'"+nick+"' is already a nickname in use.");
			user.send(mo);
		}
	}
	setNick(user,nick){
		for(let [k,v] of this.users){
			if(v.uuid==user.uuid){
				var mo = new MsgObj("msg","notice","'"+user.nick+"' changed its name to '"+nick+"'.");
				v.nick = nick;
				v.sync();
				v.broadcast(mo);
				v.syncRooms();
			}
		}
	}
	hasNick(nick,user){
		for(let [k,v] of this.users){
			if(v.uuid==user.uuid) continue;
			if(v.nick == nick){return true;}
		}
		return false;
	}
	broadcast(mo){
		console.log(this+".broadcast("+mo+")");
		this.users.forEach(function(v,k,m){
			v.send(mo);
		})
	}

}

module.exports = UserManager;

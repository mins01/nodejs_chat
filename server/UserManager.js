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
		if(!this.hasNick(nick)){
			var mo = new MsgObj("msg","notice","'"+user.nick+"' changed its name to '+nick+'.");
			user.nick = nick;
			user.sync();
			user.broadcast(mo);
			user.syncRooms();

		}else{
			var mo = new MsgObj("msg","system","'"+nick+"' is already a nickname in use.");
			user.send(mo);
		}
	}
	hasNick(nick){
		for(let [k,v] of this.users){
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

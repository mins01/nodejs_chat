// const Room = require("./Room.js");
// const Room = require("./Room.js");

class UserManager {
	constructor(){
		console.log("constructor "+this+"()");
		this.users = {};
	}
	
	toString(){
		return this.constructor.name;
	}
	
	add(user){
		console.log(this+".addUser("+user+")");
		if(this.users[user.uid]){
			return false;
		}
		this.users[user.uid] = user;
	}
	
	remove(user){
		console.log(this+".onremove("+user+")");
		if(!this.users[user.uid]){
			return false;
		}
		delete this.users[user.uid];
		return true;
	}
	
	broadcast(mo){
		console.log(this+".broadcast("+mo+")");

		for(var x in this.users){
			this.users[x].send(mo);
		}
	}
	
}

module.exports = UserManager;
// const Room = require("./Room.js");
// const Room = require("./Room.js");

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
	
	broadcast(mo){
		console.log(this+".broadcast("+mo+")");
		this.users.forEach(function(v,k,m){
			v.send(mo);
		})
	}
	
}

module.exports = UserManager;
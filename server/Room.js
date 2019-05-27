// const UserManager = require("./UserManager.js");
const MsgObj = require("./MsgObj.js");


class Room{
	constructor(rid,subject,opt){
		this.rid = rid;
		this.users = {};
		this.subject = subject;
		this.opt = Object.assign({"limitUsers":10},opt);
		// this.um = new UserManager();
		console.log("constructor "+this+"()");
	}
	toString(){
		return this.constructor.name+"#"+this.rid;
	}
	
	get limitUsers(){
		return this.opt.limitUsers
	}
	set limitUsers(limitUsers){
		console.log(this+".limitUsers=",limitUsers);
		this.opt.limitUsers = limitUsers;
	}
	
	join(user){
		this.add(user);
		console.log(this+".join("+user+")" );
		var mo = new MsgObj();
		mo.cmd = "notice";
		mo.rid = this.rid;
		mo.val = "join User : "+user.nick;
		this.add(user);
		this.broadcast(mo)
	}
	leave(user){
		this.add(user);
		console.log(this+".leave("+user+")" );
		var mo = new MsgObj();
		mo.cmd = "notice";
		mo.rid = this.rid;
		mo.val = "leave User : "+user.nick;
		this.remove(user);
		this.broadcast(mo);
	}
	
	
	
	
	add(user){
		console.log(this+".add("+user+")");
		if(this.users[user.uid]){
			return false;
		}
		this.users[user.uid] = user;
		user.rooms.set(this.rid,this); //유저에 방 연결
	}
	
	remove(user){
		console.log(this+".onremove("+user+")");
		if(!this.users[user.uid]){
			return false;
		}
		user.rooms.delete(this.rid);
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

module.exports = Room;
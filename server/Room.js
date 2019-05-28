// const UserManager = require("./UserManager.js");
const MsgObj = require("./MsgObj.js");
const ExtendedMap = require("./ExtendedMap.js");


class Room{
	constructor(rid,subject,opt){
		this.rid = rid;
		this.users = new ExtendedMap();
		this.subject = subject;
		this.opt = Object.assign({"limitUsers":10},opt);
		// this.um = new UserManager();
		console.log("constructor "+this+"()");
	}
	toString(){
		return this.constructor.name+"#"+this.rid;
	}
	toJSON(){
		// console.log(this.users,this.users.toJSON);
		return {
			"rid":this.rid,
			"users":this.users.toJSON(),
			"userCount":this.users.size,
			"subject":this.subject,
		}
	}
	
	get limitUsers(){
		return this.opt.limitUsers
	}
	set limitUsers(limitUsers){
		console.log(this+".limitUsers=",limitUsers);
		this.opt.limitUsers = limitUsers;
	}
	
	join(user){
		console.log(this+".join("+user+")" );
		this.add(user);
		var mo = new MsgObj();
		mo.cmd = "notice";
		mo.val = "Join User ["+user.nick+"]";
		this.broadcast(mo)
		this.sync();
	}
	leave(user){
		console.log(this+".leave("+user+")" );
		var mo = new MsgObj();
		mo.cmd = "notice";
		mo.val = "Leave User ["+user.nick+"]";
		this.remove(user);
		this.broadcast(mo);
		this.sync();
	}
	sync(){
		var mo = new MsgObj();
		mo.cmd = "room";
		mo.action = "sync";
		mo.val = this.toJSON();
		this.broadcast(mo)
	}	
	
	add(user){
		console.log(this+".add("+user+")");
		if(this.users.has(user.uid)){
			return false;
		}
		this.users.set(user.uid,user);
		user.rooms.set(this.rid,this); //유저에 방 연결
	}
	
	remove(user){
		console.log(this+".onremove("+user+")");
		if(!this.users.has(user.uid)){
			return false;
		}
		user.rooms.delete(this.rid);
		this.users.delete(user.uid);
		return true;
	}
	
	broadcast(mo){
		mo.rid = this.rid;
		console.log(this+".broadcast("+mo+")");

		this.users.forEach(function(v,k,m){
			v.send(mo);
		})
	}

}

module.exports = Room;
// const UserManager = require("./UserManager.js");
const MsgObj = require("./MsgObj.js");
const ExtendedMap = require("./ExtendedMap.js");


class Room{
	constructor(rid,subject,opt){
		this.rid = rid;
		this.users = new ExtendedMap();
		this.adminUids = new Set();
		this.subject = subject;
		this.adminPassword = "1234";
		this.opt = Object.assign({"maxUserCount":10},opt);
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
			"users":this.getUsersWithisAdmin(),
			"userCount":this.userCount,
			"maxUserCount":this.maxUserCount,
			"subject":this.subject,
		}
	}
	getUsersWithisAdmin(){
		var thisC = this;
		var users = this.users.toJSON()
		for(let uid in users){
			let v = users[uid];
			v.isAdmin = thisC.adminUids.has(v.uid);
		}
		return users;
	}
	get userCount(){
		return this.users.size
	}
	get maxUserCount(){
		return this.opt.maxUserCount
	}
	set maxUserCount(maxUserCount){
		console.log(this+".maxUserCount=",maxUserCount);
		this.opt.maxUserCount = maxUserCount;
	}
	setMaxUserCount(maxUserCount){
		maxUserCount = parseInt(maxUserCount)
		if(isNaN(maxUserCount)){
			return false;
		}
		this.maxUserCount= Math.max(1,maxUserCount);
		return this.maxUserCount;
	}
	setSubject(subject){
		this.subject = subject
		return true;
	}
	isAdmin(user){
		return this.adminUids.has(user.uid)
	}
	checkPassword(password){
		return (password == this.adminPassword);
	}
	grantAdmin(user,password){
		if(this.isAdmin(user.uid)){

		}else{
			this.adminUids.add(user.uid);
			var mo = new MsgObj("msg","notice",user.nick+" become a administrator.");
			this.broadcast(mo)
			return true;
		}
		return false;
	}
	revokeAdmin(user){
		if(this.isAdmin(user)){
			this.adminUids.delete(user.uid);
			var mo = new MsgObj("msg","notice",user.nick+" was fired from a administrator.");
			this.broadcast(mo)
			return true;
		}
		return false;
	}

	join(user){
		console.log(this+".join("+user+")" );
		if(this.maxUserCount <= this.userCount){
			var mo = new MsgObj("msg","system","Exceeds the maximum user count.");
			user.send(mo);
			return false;
		}else{
			this.add(user);
			var mo = new MsgObj("msg","notice",user.nick+" entered the room.");
			this.broadcast(mo)
			this.sync();
		}

	}
	leave(user){
		console.log(this+".leave("+user+")" );
		var mo = new MsgObj("msg","notice",user.nick+" left the room.");
		this.remove(user);
		this.broadcast(mo);
		this.sync();
	}
	sync(){
		var mo = new MsgObj();
		mo.app = "room";
		mo.fun = "sync";
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
		this.adminUids.delete(user.uid);
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

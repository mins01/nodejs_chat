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
	
	admin(user,password){
		if(this.adminUids.has(user.uid)){
			
		}else if(password!= this.adminPassword){
			var mo = new MsgObj();
			mo.cmd = "whisper";
			mo.rid = this.rid;
			mo.val = "Wrong password";
			user.send(mo);
		}else{
			this.adminUids.add(user.uid);
			var mo = new MsgObj();
			mo.cmd = "notice";
			mo.val = user.nick+" is Admin";
			this.broadcast(mo)
			return true;
		}
		return false;
	}
	dropAdmin(user,password){
		if(this.adminUids.has(user.uid)){
			this.adminUids.delete(user.uid);
			var mo = new MsgObj();
			mo.cmd = "notice";
			mo.val = user.nick+" is not Admin";
			this.broadcast(mo)
			return true;
		}
		return false;
	}
	
	join(user){
		console.log(this+".join("+user+")" );
		if(this.maxUserCount <= this.userCount){
			var mo = new MsgObj();
			mo.cmd = "error";
			mo.val = "maxUserCount <= userCount";
			user.send(mo);
			return false;
		}else{
			this.add(user);
			var mo = new MsgObj();
			mo.cmd = "notice";
			mo.val = "Join User ["+user.nick+"]";
			this.broadcast(mo)
			this.sync();	
		}
		
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
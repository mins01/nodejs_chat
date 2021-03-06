// const UserManager = require("./UserManager.js");
const MsgObj = require("./MsgObj.js");
const ExtendedMap = require("./ExtendedMap.js");
const ExtendedSet = require("./ExtendedSet.js");

class Room{
	constructor(rid,subject,opt){
		this.rid = rid;
		this.users = new ExtendedMap();
		this.adminUids = new ExtendedSet();
		this.banUuids = new ExtendedMap();
		// this.banUuids.set("k","v");
		this.subject = subject;
		this.adminPassword = "1234";
		this.immutable = false;
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
			"immutable":this.immutable,
			"banUuids":this.banUuids.toJSON(),
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
		if(subject.length>100){return false;}
		this.subject = subject
		return true;
	}
	isAdmin(user){
		return this.adminUids.has(user.uid)
	}
	checkPassword(password){
		return (password == this.adminPassword);
	}
	grantAdmin(user){
		if(this.isAdmin(user.uid)){

		}else{
			this.adminUids.add(user.uid);
			var mo = new MsgObj("msg","notice",user.nick+" become a administrator in the room.");
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
		if(this.banUuids.has(user.uuid)){
			var mo = new MsgObj("msg","system","You are baned from room("+this.subject+")");
			user.send(mo);
			return false;
		}else if(this.maxUserCount <= this.userCount){
			var mo = new MsgObj("msg","system","Exceeds the maximum user count.");
			user.send(mo);
			return false;
		}else{
			this.add(user);
			if(this.users.size==1){
				this.grantAdmin(user)
			}
			this.sync();
			var mos = [
				new MsgObj("msg","notice",user.nick+" entered the room("+this.subject+")."),
				new MsgObj("room","join",user.uid),
			];
			this.broadcast(mos)
		}
		return true;
	}
	leave(user){
		console.log(this+".leave("+user+")" );
		// 임시
		this.remove(user);
		this.sync();
		this.broadcast([
				new MsgObj("msg","notice",user.nick+" left the room("+this.subject+")."),
				new MsgObj("room","leave",user.uid),
		]);
		
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


	listBan(){

	}
	addBan(uuid){

	}
	deleteBan(uuid){

	}


	reqHandler(user,mo){
		var room = this;
		var r;
		switch (mo.fun) {
			case "grantAdmin":
			if(!room.checkPassword(mo.val)){
				var mo2 = new MsgObj("msg","system","Wrong password");
				mo2.rid = room.rid;
				user.send(mo2);
			}else if(room.grantAdmin(user)){
				room.sync();
			}
			break;
			case "revokeAdmin":
			if(!room.isAdmin(user)){
				console.warn("is not admin");
			}else if(room.revokeAdmin(user)){
				room.sync();
			}
			break;
			case "setSubject":
			if(!room.isAdmin(user)){
				console.warn("is not admin");
			}else if(room.immutable){
				user.send(new MsgObj("msg","system","Room is immutable."))
			}else if(room.setSubject(mo.val)){
				var mo2 = new MsgObj("msg","notice","The subject has been changed to '"+mo.val+"'.");
				room.broadcast(mo2);
				room.sync();
			}else{
				user.send(new MsgObj("msg","system","The subject has not been changed to "+mo.val+"."))
			}
			break;
			case "setMaxUserCount":
			if(!room.isAdmin(user)){
				console.warn("is not admin");
			}else if(room.immutable){
				user.send(new MsgObj("msg","system","Room is immutable."))
			}else if(room.setMaxUserCount(mo.val)){
				var mo2 = new MsgObj("msg","notice","The maximum user count has been changed to "+mo.val+".");
				room.broadcast(mo2);
				room.sync();
			}else{
				user.send(new MsgObj("msg","system","The maximum user count has not been changed to "+mo.val+"."))
			}
			break;

			case "join":
			if(room.join(user)){
			}
			break;
			case "leave":
			if(room.leave(user)){
			}
			break;
			case "kick": //여기서 하면 퇴장만 한다, roomManager 에서 하면 lobby로 이동시킨다
			if(!room.isAdmin(user)){
				console.warn("is not admin");
			}else if(room.immutable){
				user.send(new MsgObj("msg","system","Room is immutable."))
			}else if(!room.users.has(mo.uid)){
				user.send(new MsgObj("msg","system","User(#"+mo.uid+") is not exists in the room."))
			}else{
				var u = room.users.get(mo.val);
				room.broadcast(new MsgObj("msg","notice","User("+u.nick+") was kicked out of the room by Admin("+user.nick+")"));
				room.leave(u)
			}
			break;
			case "ban":
			// var room = this.rooms.get(mo.rid);
			if(!room.isAdmin(user)){
				console.warn("is not admin");
			}else if(room.immutable){
				user.send(new MsgObj("msg","system","Room is immutable."))
			}else if(!room.users.has(mo.uid)){
				user.send(new MsgObj("msg","system","User(#"+mo.uid+") is not exists in the room."))
			}else{
				var u = room.users.get(mo.val);
				room.broadcast(new MsgObj("msg","notice","User("+u.nick+") was banned from the room by Admin("+user.nick+")"));
				room.banUuids.set(u.uuid,u.nick);
				room.sync();
				// room.leave(u)
			}
			break;
			case "deleteBan":
			// var room = this.rooms.get(mo.rid);
			if(!room.isAdmin(user)){
				console.warn("is not admin");
			}else if(room.immutable){
				user.send(new MsgObj("msg","system","Room is immutable."))
			}else if(!room.banUuids.has(mo.val)){
				user.send(new MsgObj("msg","system","User(#"+mo.uid+") is not exists in ban list."))
			}else{
				var nick = room.banUuids.get(mo.val)
				room.broadcast(new MsgObj("msg","notice","User("+nick+"#"+mo.val+") was not banned from the room by Admin("+user.nick+")"));
				room.banUuids.delete(mo.val);
				room.sync();
			}
			break;
			default:
		}
	}

}

module.exports = Room;

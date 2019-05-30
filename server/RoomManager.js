const MsgObj = require("./MsgObj.js");
const Room = require("./Room.js");
const ExtendedMap = require("./ExtendedMap.js");


class RoomManager {
	constructor(){
		console.log("constructor"+this+"()");
		this.rooms = new ExtendedMap() ;
	}
	
	toString(){
		return this.constructor.name;
	}
	toJSON(){
		// console.log(this.users,this.users.toJSON);
		return {
			"rooms":this.getRoomList()
		}
	}
	getRoomList(){
		var rooms = {}
		for(var [k,v] of this.rooms){
			let t = v.toJSON();
			delete t.users;
			rooms[k] = t;
		}
		return rooms;
		
	}
	sync(user){
		var mo = new MsgObj();
		mo.app = "roomManager";
		mo.fun = "sync";
		mo.val = this.toJSON();
		user.send(mo)
	}
	
	room(rid){
		if(!this.rooms.has(rid)){
			return null; //해당 방이 없음
		}
		return this.rooms.get(rid);
	}
	
	create(subject,rid){
		if(rid==null){
			var rid = Math.floor(Math.random()*34).toString(34)+(subject.length).toString(34)+(new Date).getTime().toString(34)
		}
		console.log(this+".createRoom("+subject+","+rid+")");
		rid = rid.toString().substr(0,100);
		subject = subject.toString().substr(0,100);
		if(subject.length<2){
			return false;
		}
		if(this.rooms.has(rid)){
			return false;//'이미 같은 아이디의 방이 있음';
		}
		var opt = {};
		var room = new Room(rid,subject,opt);
		room.maxUserCount = 10;
		this.rooms.set(rid,room);
		return room;
	}
	
	join(user,rid){
		console.log(this+".join("+user+","+rid+")" );
		var room = this.room(rid);
		if(!room){
			console.error("Not exists room.", rid);
			return;
		}
		
		room.join(user);
	}
	leave(user,rid){
		console.log(this+".leave("+user+","+rid+")" );
		var room = this.room(rid);
		if(!room){
			console.error("Not exists room.", rid);
			return;
		}
		
		room.leave(user);
	}
	reqHandler(user,mo){
		var r;
		switch (mo.fun) {
			case "create":
				if(r = this.create(mo.val)){
					var mo2 = new MsgObj("roomManager","create",r.rid);
					user.send(mo2)
					this.sync(user)
				}
			break;
			case "join":
				if(this.join(user,mo.val)){
				}
			break;
			case "leave":
				if(this.leave(user,mo.val)){
				}
			break;
			case "sync":
				if(this.sync(user)){
				}
			break;
		}
	}
}

module.exports = RoomManager;
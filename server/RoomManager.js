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
	remove(room){
		if(room.immutable){
			// user.broadcast(new MsgObj("msg","system","Room is immutable."))
			var mo2 = new MsgObj("msg","system","Room is immutable.");
			return mo2;
		}
		room.broadcast(new MsgObj("msg","system","Will close the room."))
		for( var [k,v] of room.users){
			room.leave(v);
			this.join(v,"lobby");
		}
		this.rooms.delete(room.rid);
		room = null;
		return true;
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
			return true;
		}
		room.leave(user);
		if(room.users.size==0){
			this.remove(room);
		}
		return true;
	}
	leaveAndJoin(user,fromRid,toRid){

		if(this.rooms.has(toRid) && this.leave(user,fromRid)){
			this.join(user,toRid);
		}else{
			console.warn("Fail leaveAndJoin("+user+","+fromRid+","+toRid+")");
		}
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
			case "leaveAndJoin":
				if(this.leaveAndJoin(user,mo.val,mo.rid)){
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
			case "remove":
			if(!this.rooms.has(mo.val)){
				var mo2 = new MsgObj("msg","system","Not exists room("+mo.val+")");
				user.send(mo2)
			}else{
				var room = this.rooms.get(mo.val);
				if(!room.isAdmin(user)){
 					console.warn("is not admin");
				}else if(r = this.remove(room)){
					if(r!==true){ //실패임
						user.send(r);
					}
				}
			}
			break;
			case "sync":
				if(this.sync(user)){
				}
			break;

			case "kick":
			var room = this.rooms.get(mo.rid);
			if(!room.isAdmin(user)){
				console.warn("is not admin");
			}else if(room.immutable){
				user.send(new MsgObj("msg","system","Room is immutable."))
			}else if(!room.users.has(mo.uid)){
				user.send(new MsgObj("msg","system","User(#"+mo.uid+") is not exists in the room."))
			}else{
				var u = room.users.get(mo.val);
				room.broadcast(new MsgObj("msg","notice","User("+u.nick+") was kicked out of the room by Admin("+user.nick+")"));
				this.leaveAndJoin(u,room.rid,'lobby');
				// room.leave(u)
			}
			break;
		}
	}
}

module.exports = RoomManager;

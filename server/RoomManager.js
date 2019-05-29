const Room = require("./Room.js");

class RoomManager {
	constructor(){
		console.log("constructor"+this+"()");
		this.rooms = {};
	}
	
	toString(){
		return this.constructor.name;
	}
	
	room(rid){
		if(!this.rooms[rid]){
			return null; //해당 방이 없음
		}
		return this.rooms[rid];
	}
	
	create(rid,subject){
		console.log(this+".createRoom("+rid+","+subject+")");
		rid = rid.toString().substr(0,100);
		subject = subject.toString().substr(0,100);
		if(subject.length<2){
			return false;
		}
		if(this.rooms[rid]){
			return false;//'이미 같은 아이디의 방이 있음';
		}
		var opt = {};
		this.rooms[rid] = new Room(rid,subject,opt);
		this.rooms[rid].maxUserCount = 10;
		return this.rooms[rid];
	}
	
	join(rid,user){
		
		var room = this.room(rid);
		if(!room){
			console.error("Not exists room.", rid);
			return;
		}
		console.log(this+".join("+room+","+user+")" );
		room.join(user);
	}
}

module.exports = RoomManager;
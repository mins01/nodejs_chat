
class User {
	constructor(conn,uid,nick){
		this.uid = uid;
		this.conn = conn;
		this.nick = nick;
		this.rooms = new Map();
		console.log("constructor "+this+"()");
		console.log("User Info",conn.socket.remoteAddress,conn.socket.remotePort);
		
	}
	
	toString(){
		return this.constructor.name+"#"+this.uid;
	}
	
	send(mo){
		mo.time = (new Date()).getTime();
		this.conn.sendText(mo.toJson());
	}
}

module.exports = User;
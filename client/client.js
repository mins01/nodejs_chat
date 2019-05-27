class Client {
	constructor(){
		console.log("constructor "+this+"()");
		
		this.conn = null;
	}
	toString(){
		return this.constructor.name;
	}
	
	connect(url){
		if(!url){
			url = "ws://"+window.location.hostname+":8081";
		}
		this.conn = new WebSocket(url);
		this.conn.onopen = this.onopen.bind(this);
		this.conn.onclose = this.onclose.bind(this);
		this.conn.onerror = this.onerror.bind(this);
		this.conn.onmessage = this.onmessage.bind(this);
	}
	
	onopen(event){
		console.log(this+".onopen()");
	}
	onclose(event){
		console.log(this+".onclose()");
	}
	onerror(event){
		console.log(this+".onerror()");
	}
	onmessage(event){
		// var res = JSON.parse(event.data);
		console.log(this+".onmessage("+event.data+")");
	}
	
	send(mo){
		this.conn.send(mo.toJson())
	}
	
}

// module.exports = Room;

